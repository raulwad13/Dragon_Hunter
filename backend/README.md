# Backend Java de Dragon Hunter 🐉

Este backend es la parte del juego que **decide qué ocurre** cuando pulsas un botón. El navegador enseña los botones y los resultados; Java lleva las cuentas de la partida.

## Cómo ejecutarlo

Necesitas **Java 17** y **Maven**.

```bash
cd backend
mvn spring-boot:run
```

El servidor arranca en `http://localhost:8080`. Desde otra terminal, en la raíz del repositorio, ejecuta `python -m http.server 5500` y abre `http://localhost:5500`.

## ¿Qué archivos Java hay?

- `DragonHunterApplication.java`: arranca Spring Boot.
- `GameController.java`: recibe las acciones y contiene las reglas del juego.
- `GameControllerTest.java` (en `src/test/`): comprueba algunos comportamientos de la API.

## Cómo se conectan JavaScript y Java

1. Pulsas un botón, por ejemplo **Atacar**.
2. `JS/api-client.js` envía `{"action":"ATTACK"}` usando `fetch()`.
3. Spring Boot recibe la petición en `POST /api/games/{id}/actions`.
4. El método `act()` decide qué hacer y llama a `attack()`.
5. Java calcula el daño y devuelve la vida, el oro, la experiencia y el mensaje.
6. JavaScript actualiza los textos y botones de la pantalla.

## Métodos importantes

| Método | Explicación sencilla |
|---|---|
| `createGame()` | Crea una partida nueva. |
| `getGame()` | Consulta los datos de una partida. |
| `act()` | Lee la acción del botón y comprueba si está permitida. |
| `startFight()` | Prepara el enemigo que vas a combatir. |
| `attack()` | Calcula el daño, la victoria y las recompensas. |
| `dodge()` | Intenta esquivar un ataque enemigo. |
| `view()` | Prepara los datos que JavaScript mostrará. |

## Conceptos Java que aparecen

- **Clase:** agrupa código y datos relacionados, como `GameController`.
- **Método:** función de Java que hace una tarea, como `attack()`.
- **Objeto:** representa algo del juego, por ejemplo una partida.
- **`Map`:** guarda partidas usando su identificador.
- **`record`:** forma corta de representar datos, como un arma o un monstruo.
- **`@RestController`:** indica a Spring Boot que esta clase responde a peticiones web.
- **JSON:** formato de texto para intercambiar datos con JavaScript.

## Rutas de la API

| Método HTTP | Ruta | Para qué sirve |
|---|---|---|
| `POST` | `/api/games` | Crear partida |
| `GET` | `/api/games/{id}` | Consultar partida |
| `POST` | `/api/games/{id}/actions` | Pulsar una acción |

Acciones disponibles: `GO_TOWN`, `GO_STORE`, `GO_CAVE`, `FIGHT_SLIME`, `FIGHT_BEAST`, `FIGHT_DRAGON`, `BUY_HEALTH`, `BUY_WEAPON`, `ATTACK`, `DODGE`, `RUN` y `RESTART`.

## Probar el backend

```bash
cd backend
mvn test
```

**Limitaciones actuales:** las partidas están en memoria y desaparecen al reiniciar el servidor. No hay base de datos ni cuentas de usuario. El frontend necesita que el backend local esté encendido. Las pruebas se han añadido al repositorio, pero todavía no se ha confirmado su ejecución completa.

La idea es que puedas leer el código, entenderlo y explicarlo sin aprender una arquitectura complicada.
