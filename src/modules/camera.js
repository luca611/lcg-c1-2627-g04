import { TASTO_FRECCIA_SU, TASTO_FRECCIA_GIU, TASTO_FRECCIA_SINISTRA, TASTO_FRECCIA_DESTRA } from "../utils/tasti.js";

const OFFSET_BASE_X = 0;
const OFFSET_BASE_Y = 0;

const BOUNDS_X = 0;
const BOUNDS_Y = 0;

const PEEK_DISTANZA_X = 150;
const PEEK_DISTANZA_Y = 125;
const PEEK_MORBIDEZZA = 0.1;

let offset_x = OFFSET_BASE_X;
let offset_y = OFFSET_BASE_Y;
let base_y = OFFSET_BASE_Y;

export function inizializza(scene, larghezza_mondo, altezza_mondo) {
    offset_x = OFFSET_BASE_X;
    offset_y = OFFSET_BASE_Y;
    base_y = OFFSET_BASE_Y;

    PP.camera.set_bounds(scene, BOUNDS_X, BOUNDS_Y, larghezza_mondo, altezza_mondo);
}

export function segui(scene, oggetto, offset_base_y = OFFSET_BASE_Y) {
    base_y = offset_base_y;
    offset_y = offset_base_y;
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

    const destinazione_x = OFFSET_BASE_X - dir_x * PEEK_DISTANZA_X;
    const destinazione_y = base_y - dir_y * PEEK_DISTANZA_Y;

    offset_x += (destinazione_x - offset_x) * PEEK_MORBIDEZZA;
    offset_y += (destinazione_y - offset_y) * PEEK_MORBIDEZZA;
    PP.camera.set_follow_offset(scene, offset_x, offset_y);
}