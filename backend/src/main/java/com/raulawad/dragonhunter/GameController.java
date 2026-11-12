package com.raulawad.dragonhunter;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "*")
public class GameController {
    private final Map<UUID, Game> games = new ConcurrentHashMap<>();
    private final Random random = new Random();

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GameView createGame() {
        UUID id = UUID.randomUUID();
        Game game = new Game();
        games.put(id, game);
        return view(id, game);
    }

    @GetMapping("/{id}")
    public GameView getGame(@PathVariable UUID id) {
        return view(id, find(id));
    }

    @PostMapping("/{id}/actions")
    public synchronized GameView act(@PathVariable UUID id, @Valid @RequestBody ActionRequest request) {
        Game game = find(id);
        String action = request.action().trim().toUpperCase(Locale.ROOT);
        if ((game.screen.equals("WON") || game.screen.equals("LOST")) && !action.equals("RESTART")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Restart to play again.");
        }
        if ((action.equals("ATTACK") || action.equals("DODGE") || action.equals("RUN"))
                && !game.screen.equals("FIGHT")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No active combat.");
        }
        if (game.screen.equals("FIGHT") && !Set.of("ATTACK", "DODGE", "RUN", "RESTART").contains(action)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Finish or leave combat first.");
        }
        if (Set.of("BUY_HEALTH", "BUY_WEAPON").contains(action) && !game.screen.equals("STORE")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Visit the store first.");
        }
        if (Set.of("FIGHT_SLIME", "FIGHT_BEAST").contains(action) && !game.screen.equals("CAVE")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Visit the cave first.");
        }
        if (action.equals("FIGHT_DRAGON") && !game.screen.equals("TOWN")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Return to town first.");
        }
        switch (action) {
            case "GO_TOWN" -> { game.screen = "TOWN"; game.message = "You return to the town square."; game.monster = null; }
            case "GO_STORE" -> { game.screen = "STORE"; game.message = "Welcome to the store. Spend your gold wisely."; }
            case "GO_CAVE" -> { game.screen = "CAVE"; game.message = "The cave is dark. Choose your opponent."; }
            case "FIGHT_SLIME" -> startFight(game, 0);
            case "FIGHT_BEAST" -> startFight(game, 1);
            case "FIGHT_DRAGON" -> startFight(game, 2);
            case "BUY_HEALTH" -> {
                if (game.health >= 100) game.message = "Your health is already full.";
                else if (game.gold < 10) game.message = "You need 10 gold to buy health.";
                else { game.gold -= 10; game.health = Math.min(100, game.health + 10); game.message = "You restored up to 10 health."; }
            }
            case "BUY_WEAPON" -> {
                if (game.weaponIndex >= 3) game.message = "You already own the strongest weapon.";
                else if (game.gold < 30) game.message = "You need 30 gold to buy a weapon.";
                else { game.gold -= 30; game.weaponIndex++; game.inventory.add(WEAPONS[game.weaponIndex].name()); game.message = "You bought " + WEAPONS[game.weaponIndex].name() + "."; }
            }
            case "ATTACK" -> attack(game);
            case "DODGE" -> dodge(game);
            case "RUN" -> { game.screen = "TOWN"; game.monster = null; game.dodging = false; game.message = "You escaped safely."; }
            case "RESTART" -> { games.put(id, new Game()); return view(id, games.get(id)); }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown action: " + request.action());
        }
        return view(id, game);
    }

    private Game find(UUID id) {
        Game game = games.get(id);
        if (game == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Game session not found.");
        return game;
    }

    private void startFight(Game game, int index) {
        game.monster = MONSTERS[index];
        game.monsterHealth = game.monster.health();
        game.screen = "FIGHT";
        game.message = "A " + game.monster.name() + " appears!";
    }

    private void dodge(Game game) {
        // Dodging takes a turn: there is a chance to avoid the enemy completely.
        boolean success = random.nextBoolean();
        int damage = success ? 0 : Math.max(1, game.monster.level() * 2);
        game.health = Math.max(0, game.health - damage);
        game.message = success ? "Great dodge! You avoided the attack."
                : "The enemy caught you while dodging. You lost " + damage + " health.";
        if (game.health == 0) {
            game.screen = "LOST";
            game.message += " You were defeated.";
        }
    }

    private void attack(Game game) {
        Weapon weapon = WEAPONS[game.weaponIndex];
        int damage = weapon.damage() + random.nextInt(Math.max(1, game.xp + 1));
        game.monsterHealth = Math.max(0, game.monsterHealth - damage);
        game.message = "You hit " + game.monster.name() + " for " + damage + " damage.";

        // A defeated monster cannot retaliate.
        if (game.monsterHealth == 0) {
            if (game.monster.name().equals("Fatalis")) {
                game.screen = "WON";
                game.message += " Fatalis has fallen. You saved the kingdom!";
            } else {
                int reward = game.monster.level() * 7;
                game.gold += reward;
                game.xp += game.monster.level();
                game.screen = "CAVE";
                game.message += " Victory! +" + reward + " gold and +" + game.monster.level() + " XP.";
                game.monster = null;
            }
            return;
        }

        int retaliation = Math.max(1, game.monster.level() * 3 - random.nextInt(Math.max(1, game.xp + 1)));
        game.health = Math.max(0, game.health - retaliation);
        game.message += " The enemy hits back for " + retaliation + ".";
        if (game.health == 0) {
            game.screen = "LOST";
            game.message += " You were defeated.";
        }
    }

    private GameView view(UUID id, Game game) {
        return new GameView(id, game.screen, game.xp, game.health, game.gold,
                WEAPONS[game.weaponIndex].name(), List.copyOf(game.inventory),
                game.monster == null ? null : game.monster.name(),
                game.monster == null ? 0 : Math.max(0, game.monsterHealth), game.message);
    }

    public record ActionRequest(@NotBlank String action) {}
    public record GameView(UUID id, String screen, int xp, int health, int gold,
                           String weapon, List<String> inventory, String monster,
                           int monsterHealth, String message) {}
    private record Weapon(String name, int damage) {}
    private record Monster(String name, int level, int health) {}
    private static final Weapon[] WEAPONS = {
            new Weapon("stick", 5), new Weapon("dagger", 30),
            new Weapon("claw hammer", 50), new Weapon("sword", 100)
    };
    private static final Monster[] MONSTERS = {
            new Monster("slime", 2, 15), new Monster("fanged beast", 8, 60),
            new Monster("Fatalis", 20, 300)
    };
    private static final class Game {
        private String screen = "TOWN";
        private int xp = 0, health = 100, gold = 50, weaponIndex = 0, monsterHealth = 0;
        private Monster monster;
        private String message = "Welcome, hunter. The kingdom needs you.";
        private final List<String> inventory = new ArrayList<>(List.of("stick"));
    }
}
