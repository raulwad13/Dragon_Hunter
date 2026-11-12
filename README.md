<div align="center">
  <img src="https://w0.peakpx.com/wallpaper/921/922/HD-wallpaper-video-game-elden-ring-dragon.jpg" width="600" alt="Fantasy dragon"/>
  <h1>🐉 Dragon Hunter</h1>
  <p>A browser-based RPG prototype where you explore, collect gold, upgrade weapons and fight increasingly powerful monsters.</p>
</div>

## Project status

The original HTML/CSS/JavaScript game remains the playable browser prototype. A **Java 17 + Spring Boot REST API** is now being introduced in `backend/` as the gameplay engine migration. The browser client has not yet been connected to the API, so this is an incremental migration rather than a completed replacement.

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

Open `index.html` in a browser, or serve the repository with a local static web server.

## Run the Spring Boot API

Requirements: Java 17+ and Maven 3.9+.

```bash
cd backend
mvn spring-boot:run
```

The API listens on `http://localhost:8080`.

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
- [ ] Connect the browser interface to the REST API.
- [ ] Add automated tests and persistent game saves.
- [ ] Expand locations, quests, equipment, skills and boss encounters.
- [ ] Improve responsive visuals, accessibility and animations.

## Author

Created by **Raul Awad**.
