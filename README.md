<div align="center">
  <img src="https://w0.peakpx.com/wallpaper/921/922/HD-wallpaper-video-game-elden-ring-dragon.jpg" width="600" alt="Fantasy dragon"/>
  <h1>🐉 Dragon Hunter</h1>
  <p>A browser-based RPG prototype where you explore, collect gold, upgrade weapons and fight increasingly powerful monsters.</p>
</div>

## Project status

The **Java 17 + Spring Boot REST API** in `backend/` now manages gameplay. The new browser interface uses HTML/CSS/JavaScript to send actions to the API and render its responses. This is a working architectural integration, but full end-to-end testing and game expansion remain in progress.

## Current features

- Player stats: XP, health and gold.
- Store with health and weapon upgrades.
- Cave encounters: slime, fanged beast and Fatalis.
- Turn-based attack, dodge and escape actions.
- Win, defeat and restart states.
- Original browser UI and CSS background assets.

## Technology

- **Frontend:** HTML5, CSS3 and JavaScript (legacy browser client).
- **Backend migration:** Java 17, Spring Boot 3, Spring Web and Bean Validation.
- **Build:** Maven.

## Run the original browser game

The current interface requires the Spring Boot API running locally. The original JavaScript prototype remains in `JS/index.js`, `JS/fight.js`, `JS/location.js` and `JS/easterEgg.js` for reference, but is no longer loaded by the main page.

## Run the Spring Boot API

Requirements: Java 17+ and Maven 3.9+.

```bash
cd backend
mvn spring-boot:run
```

The API listens on `http://localhost:8080`.

In a **second terminal**, from the repository root, run:

```bash
python -m http.server 5500
```

Then open **http://localhost:5500** to play. The interface calls `http://localhost:8080/api/games`. Opening the HTML file directly may work in some browsers, but a local web server is recommended. Both services must be running.

### REST endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/games` | Create a game session |
| GET | `/api/games/{id}` | Retrieve game state |
| POST | `/api/games/{id}/actions` | Apply a game action |

Example request:

```json
{ "action": "FIGHT_SLIME" }
```

Supported actions: `GO_TOWN`, `GO_STORE`, `GO_CAVE`, `FIGHT_SLIME`,
`FIGHT_BEAST`, `FIGHT_DRAGON`, `BUY_HEALTH`, `BUY_WEAPON`,
`ATTACK`, `DODGE`, `RUN` and `RESTART`.

Game sessions currently live in server memory and reset when the API restarts. Persistent accounts and saved games are not implemented yet.

## Roadmap

- [x] Add a Spring Boot backend foundation and game-session API.
- [x] Connect the browser interface to the REST API.
- [x] Add an initial original pixel-inspired responsive UI.
- [x] Add basic Spring Boot API integration test cases (not yet executed in this environment).
- [ ] Execute and expand automated tests; add persistent game saves.
- [ ] Expand locations, quests, equipment, skills and boss encounters.
- [ ] Add original sprite sheets, world exploration, accessibility refinements and animations.

## Author

Created by **Raul Awad**.
