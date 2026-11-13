import { TASTO_FRECCIA_SU, TASTO_FRECCIA_GIU, TASTO_FRECCIA_SINISTRA, TASTO_FRECCIA_DESTRA } from "../utils/tasti.js";

const ZOOM_BASE = 1;
const DURATA_ZOOM_DEFAULT_MS = 0;
const EASING_ZOOM = "Sine.easeInOut";

const OFFSET_BASE_X = 0;
const OFFSET_BASE_Y = 0;

const BOUNDS_X = 0;
const BOUNDS_Y = 0;

const PEEK_DISTANZA_X = 150;
const PEEK_DISTANZA_Y = 50;
const PEEK_MORBIDEZZA = 0.1;

let stato_camera = null;

export function inizializza(scene, larghezza_mondo, altezza_mondo) {
    stato_camera = {
        offset_x: OFFSET_BASE_X,
        offset_y: OFFSET_BASE_Y,
    };

    scene.cameras.main.setZoom(ZOOM_BASE);
    limita_ai_confini(scene, BOUNDS_X, BOUNDS_Y, larghezza_mondo, altezza_mondo);
}

export function segui(scene, oggetto) {
    PP.camera.start_follow(scene, oggetto, OFFSET_BASE_X, OFFSET_BASE_Y);
}

export function zoom(scene, livello, durata_ms) {
    if (durata_ms === 0) {
        scene.cameras.main.setZoom(livello);
    } else {
        scene.cameras.main.zoomTo(livello, durata_ms, EASING_ZOOM);
    }
}

export function ripristina_zoom(scene, durata_ms) {
    if (durata_ms === undefined || durata_ms === null) {
        durata_ms = DURATA_ZOOM_DEFAULT_MS;
    }
    zoom(scene, ZOOM_BASE, durata_ms);
}

export function limita_ai_confini(scene, x, y, larghezza, altezza) {
    PP.camera.set_bounds(scene, x, y, larghezza, altezza);
}

export function peek(scene) {
    let dir_x = 0;
    if (PP.interactive.kb.is_key_down(scene, TASTO_FRECCIA_DESTRA)) {
        dir_x = dir_x + 1;
    }
    if (PP.interactive.kb.is_key_down(scene, TASTO_FRECCIA_SINISTRA)) {
        dir_x = dir_x - 1;
    }

    let dir_y = 0;
    if (PP.interactive.kb.is_key_down(scene, TASTO_FRECCIA_GIU)) {
        dir_y = dir_y + 1;
    }
    if (PP.interactive.kb.is_key_down(scene, TASTO_FRECCIA_SU)) {
        dir_y = dir_y - 1;
    }

    let destinazione_x = OFFSET_BASE_X - dir_x * PEEK_DISTANZA_X;
    let destinazione_y = OFFSET_BASE_Y - dir_y * PEEK_DISTANZA_Y;

    stato_camera.offset_x += (destinazione_x - stato_camera.offset_x) * PEEK_MORBIDEZZA;
    stato_camera.offset_y += (destinazione_y - stato_camera.offset_y) * PEEK_MORBIDEZZA;
    PP.camera.set_follow_offset(scene, stato_camera.offset_x, stato_camera.offset_y);
}
