import * as Goody from "../modules/goody.js";
import * as Piattaforme from "../modules/piattaforme.js";
import * as GameCamera from "../modules/camera.js";
import { PIATTAFORME } from "../utils/posizione_piattaforme.js";
import * as Porte from "../modules/porte.js";

const NOME = "corridoioBN";

const COLORE_SFONDO = 0xBEBEBE;
const LARGHEZZA_MONDO = 12288;
const ALTEZZA_MONDO = 4500;

const PUO_SALTARE = true;
const DESTINAZIONE_OCCHIALI = "corridoio";

const SPAWN_X = 11169;
const SPAWN_Y = 983;
const SPAWN_DIREZIONE = 1;
const MARGINE_CADUTA = 10;

const PORTA_1_X = 629;
const PORTA_1_Y = 2876;
const PORTA_1_DESTINAZIONE = "stanzaBN";
const PORTA_2_X = 5913;
const PORTA_2_Y = 1683;
const PORTA_2_DESTINAZIONE = null;
const PORTA_3_X = 8707;
const PORTA_3_Y = 2861;
const PORTA_3_DESTINAZIONE = "stanza_goodyBN";
const PORTA_4_X = 11119;
const PORTA_4_Y = 983;
const PORTA_4_DESTINAZIONE = "salottoBN";

const OFFSET_CAMERA_Y = 120;

let goody = null;
let piattaforme = [];

function imposta_mondo(scene) {
    PP.physics.set_world_bounds(scene, 0, 0, LARGHEZZA_MONDO, ALTEZZA_MONDO);
    GameCamera.inizializza(scene, LARGHEZZA_MONDO, ALTEZZA_MONDO);
}
function crea_porte(scene) {
    const porta1 = Porte.crea(scene, PORTA_1_X, PORTA_1_Y, PORTA_1_DESTINAZIONE);
    const porta2 = Porte.crea(scene, PORTA_2_X, PORTA_2_Y, PORTA_2_DESTINAZIONE);
    const porta3 = Porte.crea(scene, PORTA_3_X, PORTA_3_Y, PORTA_3_DESTINAZIONE);
    const porta4 = Porte.crea(scene, PORTA_4_X, PORTA_4_Y, PORTA_4_DESTINAZIONE);
    return [porta1, porta2, porta3, porta4];
}

function crea_sfondo(scene) {
    scene.cameras.main.setBackgroundColor(COLORE_SFONDO);
}

function crea_piattaforme(scene) {
    return Piattaforme.crea_piattaforme(scene, PIATTAFORME);
}

function crea_giocatore(scene,porte) {
    let goody_spawn_x = null;
    let goody_spawn_y = null;
    let goody_spawn_direzione = 1;

    if(!PP.game_state.get_variable("stanzaPreSwap")){
        goody_spawn_x = PORTA_4_X;
        goody_spawn_y = PORTA_4_Y;
    }
    else{
        switch(PP.game_state.get_variable("stanzaPreSwap")){
            case "stanzaBN":
                goody_spawn_x = PORTA_1_X;
                goody_spawn_y = PORTA_1_Y;
                goody_spawn_direzione = -1;
                break;
            case "stanza_goodyBN":
                goody_spawn_x = PORTA_3_X;
                goody_spawn_y = PORTA_3_Y;
                goody_spawn_direzione = -1;
                break;
            case "stanza_bimbaBN":
                goody_spawn_x = PORTA_2_X;
                goody_spawn_y = PORTA_2_Y;
                goody_spawn_direzione = -1;
                break;
            default:
                goody_spawn_x = PORTA_4_X;
                goody_spawn_y = PORTA_4_Y;

        }
    }
    console.log(goody_spawn_x + "y:" +goody_spawn_y)
    goody = Goody.inizializza(scene, goody_spawn_x, goody_spawn_y, PUO_SALTARE, goody_spawn_direzione);
    Piattaforme.attiva_triggers_piattaforme(scene, goody, piattaforme);
    Porte.attiva_rilevamento_porte(scene, goody, porte);
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
    Piattaforme.carica_immagini_piattaforme(scene, PIATTAFORME);
}

function create(scene) {
    imposta_mondo(scene);
    crea_sfondo(scene);
    piattaforme = crea_piattaforme(scene);

    const porte = crea_porte(scene);
    crea_giocatore(scene,porte);
    imposta_camera(scene);
}

function update(scene) {
    console.log(goody.lanciato_da_molla);
    Piattaforme.aggiorna(scene, goody, piattaforme);
    Goody.aggiorna(scene, goody, DESTINAZIONE_OCCHIALI);
    riporta_allo_spawn_se_caduto();
    Porte.gestisci_interazione_porta(scene, goody);
}

function destroy(scene) {
}

PP.scenes.add(NOME, preload, create, update, destroy);
