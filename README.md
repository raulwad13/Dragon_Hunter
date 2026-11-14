<div align="center">
  <img src="assets/background/fondo.jpg" width="600" alt="Ilustración de fondo de Dragon Hunter"/>
  <h1>🐉 Dragon Hunter</h1>
  <p>Prototipo de RPG para navegador: explora, consigue oro, mejora tu equipo y enfréntate a monstruos cada vez más poderosos.</p>
</div>

**[🎮 Jugar ahora — demo para navegador y móvil](https://raulwad13.github.io/Dragon_Hunter/)**

> **Modo demo:** en GitHub Pages, el juego utiliza una simulación JavaScript local para poder jugar sin servidor. La versión completa con backend Java/Spring Boot sigue requiriendo ejecución local. El modo demo aún debe comprobarse manualmente en un móvil real.

## Estado del proyecto

El backend REST de **Java 17 y Spring Boot** en `backend/` gestiona la lógica y el estado de la partida. La interfaz HTML, CSS y JavaScript envía acciones a esa API. En GitHub Pages se activa una versión autónoma de demostración, sin persistencia ni conexión al backend. Queda pendiente comprobarla desde un móvil real.

## Funcionalidades

- Estadísticas del personaje: experiencia, vida y oro.
- Tienda con mejoras de salud y armas.
- Encuentros en la cueva: slime, bestia y Fatalis.
- Combates por turnos: atacar, esquivar y huir.
- Estados de victoria, derrota y reinicio.
- Interfaz visual adaptable, con recursos gráficos del proyecto.

## Tecnologías

- **Frontend:** HTML5, CSS3 y JavaScript.
- **Backend:** Java 17, Spring Boot 3, Spring Web y Bean Validation.
- **Compilación y pruebas:** Maven.

## Ejecutar el juego en el ordenador

Necesitas Java 17 o posterior, Maven 3.9 o posterior y Python para servir la web.

En una terminal, desde la raíz del repositorio:

```bash
cd backend
mvn spring-boot:run
```

La API estará disponible en `http://localhost:8080`.

En otra terminal, desde la raíz del repositorio:

```bash
python -m http.server 5500
```

Abre **http://localhost:5500**. Mantén los dos servidores en ejecución: la web necesita comunicarse con la API para iniciar una partida.

## Probar desde el móvil (misma red Wi-Fi)

1. Inicia Spring Boot en el ordenador.
2. Desde la raíz del repositorio, ejecuta `python -m http.server 5500 --bind 0.0.0.0`.
3. Averigua la dirección IP local del ordenador (por ejemplo, `192.168.1.20`).
4. Conecta el móvil a la misma red Wi-Fi y abre `http://IP_DEL_ORDENADOR:5500`.
5. Comprueba que el cortafuegos permite las conexiones locales a los puertos `5500` y `8080`.

**Importante:** estas instrucciones no equivalen a un despliegue público. El acceso desde móvil está pendiente de verificación real. No abras esos puertos a Internet sin proteger y configurar el servidor.

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/games` | Crear una partida |
| GET | `/api/games/{id}` | Consultar el estado |
| POST | `/api/games/{id}/actions` | Ejecutar una acción |

Ejemplo de acción:

```json
{ "action": "FIGHT_SLIME" }
```

Acciones disponibles: `GO_TOWN`, `GO_STORE`, `GO_CAVE`, `FIGHT_SLIME`, `FIGHT_BEAST`, `FIGHT_DRAGON`, `BUY_HEALTH`, `BUY_WEAPON`, `ATTACK`, `DODGE`, `RUN` y `RESTART`.

Las partidas se almacenan en memoria y se reinician cuando se reinicia la API. Todavía no hay cuentas ni guardado persistente.

## Pendiente para el portfolio

- [x] Añadir modo demo JavaScript sin backend para GitHub Pages (pendiente de prueba manual).
- [ ] Publicar la versión integrada con un backend accesible y configurado correctamente.
- [ ] Verificar el juego completo desde navegador y móvil.
- [ ] Ampliar las pruebas automáticas y comprobar la integración de extremo a extremo.
- [ ] Incorporar guardado de partidas y ampliar contenido y accesibilidad.

## Autor

Proyecto de **Raul Awad**.
