"use strict";

// Browser presentation only: Java/Spring Boot owns the game rules and state.
// En móvil, localhost sería el propio teléfono, no el ordenador.
// Usamos el mismo nombre de equipo que sirve la página.
const API_BASE = `${window.location.protocol}//${window.location.hostname}:8080/api/games`;
const labels = {
  TOWN: "PLAZA DEL PUEBLO", STORE: "TIENDA DEL VIAJERO",
  CAVE: "CUEVA DE LAS SOMBRAS", FIGHT: "¡COMBATE!",
  WON: "¡VICTORIA!", LOST: "FIN DE LA AVENTURA"
};
const actionsByScreen = {
  TOWN: [["Ir a la tienda", "GO_STORE"], ["Explorar cueva", "GO_CAVE"], ["Desafiar a Fatalis", "FIGHT_DRAGON"]],
  STORE: [["Comprar vida · 10 oro", "BUY_HEALTH"], ["Mejorar arma · 30 oro", "BUY_WEAPON"], ["Volver al pueblo", "GO_TOWN"]],
  CAVE: [["Luchar contra slime", "FIGHT_SLIME"], ["Luchar contra bestia", "FIGHT_BEAST"], ["Volver al pueblo", "GO_TOWN"]],
  FIGHT: [["Atacar", "ATTACK"], ["Esquivar", "DODGE"], ["Huir", "RUN"]],
  WON: [["Jugar otra vez", "RESTART"]],
  LOST: [["Volver a intentarlo", "RESTART"]]
};
const $ = (selector) => document.querySelector(selector);
let game = null;
let busy = false;

const demoMode = window.location.hostname.endsWith("github.io");
let demo = null;
const demoWeapons = [{name:"Palo",power:5},{name:"Daga",power:30},{name:"Martillo",power:50},{name:"Espada",power:100}];
const demoMonsters = {FIGHT_SLIME:["slime",15,2],FIGHT_BEAST:["fanged beast",60,8],FIGHT_DRAGON:["Fatalis",300,20]};
function newDemo() {
  demo={id:"demo",screen:"TOWN",message:"¡Bienvenido a Dragon Hunter! Explora el pueblo.",health:100,xp:0,gold:50,weapon:"Palo",inventory:["Palo"],weaponIndex:0,monster:null,monsterHealth:0,enemyLevel:0};
  return demo;
}
function demoAction(action) {
  const d=demo;
  if(action==="RESTART")return newDemo();
  if(action==="GO_TOWN"||action==="RUN"){d.screen="TOWN";d.monster=null;d.message="Has vuelto al pueblo.";return d;}
  if(action==="GO_STORE"||action==="GO_CAVE"){d.screen=action==="GO_STORE"?"STORE":"CAVE";d.message=d.screen==="STORE"?"Bienvenido a la tienda.":"Elige un enemigo en la cueva.";return d;}
  if(action==="BUY_HEALTH"){if(d.gold>=10){d.gold-=10;d.health=Math.min(100,d.health+10);d.message="Vida recuperada.";}else d.message="No tienes suficiente oro.";return d;}
  if(action==="BUY_WEAPON"){if(d.weaponIndex===3)d.message="Ya tienes la mejor arma.";else if(d.gold<(d.weaponIndex+1)*30)d.message="Necesitas "+((d.weaponIndex+1)*30)+" monedas.";else{d.gold-=(d.weaponIndex+1)*30;d.weaponIndex++;d.weapon=demoWeapons[d.weaponIndex].name;d.inventory.push(d.weapon);d.message="Has comprado "+d.weapon+".";}return d;}
  if(demoMonsters[action]){const m=demoMonsters[action];d.screen="FIGHT";d.monster=m[0];d.monsterHealth=m[1];d.enemyLevel=m[2];d.message="¡Aparece "+d.monster+"!";return d;}
  if(d.screen==="FIGHT"&&action==="DODGE"){d.message="¡Esquivas el ataque!";return d;}
  if(d.screen==="FIGHT"&&action==="ATTACK"){
    const damage=demoWeapons[d.weaponIndex].power+Math.floor(Math.random()*(d.xp+1))+1;
    d.monsterHealth=Math.max(0,d.monsterHealth-damage);
    if(d.monsterHealth===0){if(d.monster==="Fatalis"){d.screen="WON";d.message="¡Has derrotado a Fatalis!";}else{d.gold+=Math.floor(d.enemyLevel*6.7);d.xp+=d.enemyLevel;d.screen="TOWN";d.message="¡Victoria! Ganas experiencia y oro.";}d.monster=null;return d;}
    const received=Math.max(0,d.enemyLevel*5-Math.floor(Math.random()*(d.xp+1)));
    d.health=Math.max(0,d.health-received);
    if(d.health===0){d.screen="LOST";d.monster=null;d.message="Has caído. ¡Inténtalo otra vez!";}else d.message="Infliges "+damage+" de daño y recibes "+received+".";
  }
  return d;
}


async function request(path = "", options = {}) {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  if (!response.ok) throw new Error("Error del servidor (" + response.status + ")");
  return response.json();
}

function setConnection(online, message) {
  const badge = $("#connection");
  badge.textContent = message;
  badge.classList.toggle("offline", !online);
}

function render(state) {
  game = state;
  $("#sceneName").textContent = labels[state.screen] || state.screen;
  $("#story").textContent = state.message;
  $("#healthText").textContent = state.health + " / 100";
  $("#healthBar").style.width = Math.max(0, Math.min(100, state.health)) + "%";
  $("#xpText").textContent = state.xp + " XP";
  $("#goldText").textContent = state.gold;
  $("#weaponText").textContent = state.weapon;
  const inventory = $("#inventory");
  inventory.replaceChildren();
  for (const item of state.inventory) {
    const li = document.createElement("li");
    li.textContent = item;
    inventory.append(li);
  }
  const monsterVisible = Boolean(state.monster && state.screen === "FIGHT");
  $("#monsterPanel").hidden = !monsterVisible;
  $("#enemySprite").hidden = !monsterVisible;
  $("#enemySprite").classList.toggle("boss-dragon", monsterVisible && state.monster === "Fatalis");
  if (monsterVisible) {
    $("#monsterName").textContent = state.monster;
    $("#monsterHealth").textContent = state.monsterHealth + " PV";
    const maxHealth = { slime: 15, "fanged beast": 60, Fatalis: 300 }[state.monster] || 100;
    $("#monsterBar").style.width = Math.min(100, state.monsterHealth / maxHealth * 100) + "%";
    $("#enemySprite").src = "assets/sprites/" + (state.monster === "slime" ? "slime" : state.monster === "Fatalis" ? "dragon" : "beast") + ".svg" + (state.monster === "Fatalis" ? "?v=0429b2e" : "");
  }
  const scene = $("#scene");
  scene.className = "scene " + state.screen.toLowerCase();
  const actionBox = $("#actions");
  actionBox.replaceChildren();
  for (const [label, action] of actionsByScreen[state.screen] || []) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action === "BUY_WEAPON" ? (state.inventory.length >= 4 ? "Arma al máximo" : "Mejorar arma · " + (state.inventory.length * 30) + " oro") : label;
    button.dataset.action = action;
    button.disabled = busy;
    button.addEventListener("click", () => doAction(action));
    actionBox.append(button);
  }
}

async function doAction(action) {
  if (busy || !game) return;
  busy = true;
  document.querySelectorAll("button").forEach(button => button.disabled = true);
  try {
    const state = demoMode ? demoAction(action) : await request("/" + encodeURIComponent(game.id) + "/actions", {
      method: "POST", body: JSON.stringify({ action })
    });
    setConnection(true, demoMode ? "● Modo demo" : "● API conectada");
    render(state);
  } catch (error) {
    setConnection(false, "● Sin conexión");
    $("#story").textContent = "No se pudo realizar la acción. Comprueba que Spring Boot sigue ejecutándose. " + error.message;
  } finally {
    busy = false;
    document.querySelectorAll("button").forEach(button => button.disabled = false);
  }
}

async function startGame() {
  if (busy) return;
  busy = true;
  $("#newGame").disabled = true;
  try {
    const state = demoMode ? newDemo() : await request("", { method: "POST" });
    setConnection(true, demoMode ? "● Modo demo" : "● API conectada");
    render(state);
  } catch (error) {
    setConnection(false, "● API desconectada");
    $("#story").textContent = "Para jugar, inicia primero el servidor Java: cd backend && mvn spring-boot:run. Después recarga esta página. " + error.message;
    $("#actions").replaceChildren();
  } finally {
    busy = false;
    document.querySelectorAll("button").forEach(button => button.disabled = false);
  }
}

$("#newGame").addEventListener("click", startGame);
startGame();
