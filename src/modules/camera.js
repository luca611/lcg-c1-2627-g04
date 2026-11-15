import { TASTO_FRECCIA_SU, TASTO_FRECCIA_GIU, TASTO_FRECCIA_SINISTRA, TASTO_FRECCIA_DESTRA } from "../utils/tasti.js";

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
        base_y: OFFSET_BASE_Y,
    };

    PP.camera.set_bounds(scene, BOUNDS_X, BOUNDS_Y, larghezza_mondo, altezza_mondo);
}

export function segui(scene, oggetto, offset_base_y = OFFSET_BASE_Y) {
    stato_camera.base_y = offset_base_y;
    stato_camera.offset_y = offset_base_y;
    PP.camera.start_follow(scene, oggetto, OFFSET_BASE_X, offset_base_y);
}

export function gestisci_sbircio(scene) {
    let dir_x = 0;
    let dir_y = 0;

    if (PP.interactive.kb.is_key_down(scene, TASTO_FRECCIA_DESTRA)) {
        dir_x = dir_x + 1;
    }
    else if (PP.interactive.kb.is_key_down(scene, TASTO_FRECCIA_SINISTRA)) {
        dir_x = dir_x - 1;
    }

    if (PP.interactive.kb.is_key_down(scene, TASTO_FRECCIA_GIU)) {
        dir_y = dir_y + 1;
    }
    else if (PP.interactive.kb.is_key_down(scene, TASTO_FRECCIA_SU)) {
        dir_y = dir_y - 1;
    }

    let destinazione_x = OFFSET_BASE_X - dir_x * PEEK_DISTANZA_X;
    let destinazione_y = stato_camera.base_y - dir_y * PEEK_DISTANZA_Y;

    stato_camera.offset_x += (destinazione_x - stato_camera.offset_x) * PEEK_MORBIDEZZA;
    stato_camera.offset_y += (destinazione_y - stato_camera.offset_y) * PEEK_MORBIDEZZA;
    PP.camera.set_follow_offset(scene, stato_camera.offset_x, stato_camera.offset_y);
}
