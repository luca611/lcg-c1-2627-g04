import * as Goody from "../modules/goody.js";
import * as Piattaforme from "../modules/piattaforme.js";
import * as GameCamera from "../modules/camera.js";
import { PIATTAFORME } from "../utils/posizione_piattaforme.js";

const NOME = "corridoioBN";

const COLORE_SFONDO = 0xBEBEBE;
const LARGHEZZA_MONDO = 12288;
const ALTEZZA_MONDO = 4500;

const PUO_SALTARE = true;
const DESTINAZIONE_OCCHIALI = "corridoio";

const SPAWN_X = 10490;
const SPAWN_Y = 1125;
const SPAWN_DIREZIONE = 1;
const MARGINE_CADUTA = 10;

const OFFSET_CAMERA_Y = 120;

let goody = null;
let piattaforme = [];

function imposta_mondo(scene) {
    PP.physics.set_world_bounds(scene, 0, 0, LARGHEZZA_MONDO, ALTEZZA_MONDO);
    GameCamera.inizializza(scene, LARGHEZZA_MONDO, ALTEZZA_MONDO);
}

function crea_sfondo(scene) {
    scene.cameras.main.setBackgroundColor(COLORE_SFONDO);
}

function crea_piattaforme(scene) {
    return Piattaforme.crea_piattaforme(scene, PIATTAFORME);
}

function crea_giocatore(scene) {
    goody = Goody.inizializza(scene, SPAWN_X, SPAWN_Y, PUO_SALTARE, SPAWN_DIREZIONE);
    Piattaforme.attiva_triggers_piattaforme(scene, goody, piattaforme);
}

function imposta_camera(scene) {
    GameCamera.segui(scene, goody, OFFSET_CAMERA_Y);
}

function riporta_allo_spawn_se_caduto() {
    if (goody.geometry.y < ALTEZZA_MONDO - MARGINE_CADUTA) return;
    goody.geometry.x = SPAWN_X;
    goody.geometry.y = SPAWN_Y;
    PP.physics.set_velocity_x(goody, 0);
    PP.physics.set_velocity_y(goody, 0);
}

function preload(scene) {
    Goody.carica(scene);
}

function create(scene) {
    imposta_mondo(scene);
    crea_sfondo(scene);
    piattaforme = crea_piattaforme(scene);
    crea_giocatore(scene);
    imposta_camera(scene);
}

function update(scene) {
    console.log(goody.lanciato_da_molla);
    Piattaforme.aggiorna(scene, goody, piattaforme);
    Goody.aggiorna(scene, goody, DESTINAZIONE_OCCHIALI);
    riporta_allo_spawn_se_caduto();
}

function destroy(scene) {
}

PP.scenes.add(NOME, preload, create, update, destroy);
