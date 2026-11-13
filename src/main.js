const LARGHEZZA_SCHERMO = 1280;
const ALTEZZA_SCHERMO = 720;
const GRAVITA = 900;

const CANVAS_ID = "game";
const COLORE_SFONDO = 0x000000;
const DEBUG_MODE = true;

PP.game.create({
    canvas_width: LARGHEZZA_SCHERMO,
    canvas_height: ALTEZZA_SCHERMO,
    canvas_id: CANVAS_ID,
    background_color: COLORE_SFONDO,
    debug_mode: DEBUG_MODE,
    gravity_value: GRAVITA,
});

