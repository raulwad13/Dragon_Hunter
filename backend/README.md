# Dragon Hunter API

Spring Boot REST API for the Dragon Hunter RPG.

## Requirements
- Java 17+
- Maven 3.9+ (or use the Maven wrapper once generated)

## Run locally
```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/games` | Create a new game session |
| GET | `/api/games/{id}` | Read the current game state |
| POST | `/api/games/{id}/actions` | Apply a game action |

Example action body:
```json
{ "action": "GO_CAVE" }
```

Supported actions: `GO_TOWN`, `GO_STORE`, `GO_CAVE`, `FIGHT_SLIME`,
`FIGHT_BEAST`, `FIGHT_DRAGON`, `BUY_HEALTH`, `BUY_WEAPON`,
`ATTACK`, `DODGE`, `RUN`, `RESTART`.

Game sessions are currently held in memory and are lost when the server restarts.
The existing static browser game remains available while the frontend is connected
to this API in the next migration step.
