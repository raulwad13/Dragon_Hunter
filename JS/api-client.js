"use strict";

// Browser presentation only: Java/Spring Boot owns the game rules and state.
const API_BASE = "http://localhost:8080/api/games";
const labels = {
  TOWN: "PLAZA DEL PUEBLO", STORE: "TIENDA DEL VIAJERO",
  CAVE: "CUEVA DE LAS SOMBRAS", FIGHT: "¡COMBATE!",
  WON: "¡VICTORIA!", LOST: "FIN DE LA AVENTURA"
};
const actionsByScreen = {
  TOWN: [["🏪 Ir a la tienda", "GO_STORE"], ["⛰️ Explorar cueva", "GO_CAVE"], ["🐉 Desafiar a Fatalis", "FIGHT_DRAGON"]],
  STORE: [["❤️ Comprar vida · 10 oro", "BUY_HEALTH"], ["🗡️ Mejorar arma · 30 oro", "BUY_WEAPON"], ["↩ Volver al pueblo", "GO_TOWN"]],
  CAVE: [["🟢 Luchar contra slime", "FIGHT_SLIME"], ["🐺 Luchar contra bestia", "FIGHT_BEAST"], ["↩ Volver al pueblo", "GO_TOWN"]],
  FIGHT: [["⚔️ Atacar", "ATTACK"], ["🛡️ Esquivar", "DODGE"], ["🏃 Huir", "RUN"]],
  WON: [["🎉 Jugar otra vez", "RESTART"]],
  LOST: [["↻ Volver a intentarlo", "RESTART"]]
};
const $ = (selector) => document.querySelector(selector);
let game = null;
let busy = false;

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
  if (monsterVisible) {
    $("#monsterName").textContent = state.monster;
    $("#monsterHealth").textContent = state.monsterHealth + " PV";
    const maxHealth = { slime: 15, "fanged beast": 60, Fatalis: 300 }[state.monster] || 100;
    $("#monsterBar").style.width = Math.min(100, state.monsterHealth / maxHealth * 100) + "%";
    $("#enemySprite").textContent = state.monster === "slime" ? "🟢" : state.monster === "Fatalis" ? "🐉" : "🐺";
  }
  const scene = $("#scene");
  scene.className = "scene " + state.screen.toLowerCase();
  const actionBox = $("#actions");
  actionBox.replaceChildren();
  for (const [label, action] of actionsByScreen[state.screen] || []) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
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
    const state = await request("/" + encodeURIComponent(game.id) + "/actions", {
      method: "POST", body: JSON.stringify({ action })
    });
    setConnection(true, "● API conectada");
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
    const state = await request("", { method: "POST" });
    setConnection(true, "● API conectada");
    render(state);
  } catch (error) {
    setConnection(false, "● API desconectada");
    $("#story").textContent = "Para jugar, inicia primero el servidor Java: cd backend && mvn spring-boot:run. Después recarga esta página. " + error.message;
    $("#actions").replaceChildren();
  } finally {
    busy = false;
    $("#newGame").disabled = false;
  }
}

$("#newGame").addEventListener("click", startGame);
startGame();
