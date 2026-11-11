import * as Goody from "../modules/goody.js";
import * as Porte from "../modules/porte.js";
import * as GameCamera from "../modules/camera.js";

const LARGHEZZA_SCHERMO = 1280;
const ALTEZZA_SCHERMO = 720;

const NOME = "corridoio";

const SFONDO = "./resources/imgs/ambienti/corridoio/Corridoio.jpg";
const LARGHEZZA_MONDO = 2000;

const SFONDO_X = 0;
const SFONDO_Y = 0;
const SFONDO_ORIGINE = 0;

const PAVIMENTO_Y = 600;
const PAVIMENTO_COLORE = "0x000000";
const PAVIMENTO_ALPHA = 0;

const PUO_SALTARE = false;
const SPAWN_X = 150;
const SPAWN_DIREZIONE = 1;
const DESTINAZIONE_OCCHIALI = null;

const PORTA_1_X = 150;
const PORTA_1_DESTINAZIONE = "stanza";
const PORTA_2_X = 560;
const PORTA_2_DESTINAZIONE = null;
const PORTA_3_X = 1060;
const PORTA_3_DESTINAZIONE = null;
const PORTA_4_X = 1490;
const PORTA_4_DESTINAZIONE = null;

const assets = {};
let goody = null;

function imposta_mondo(scene) {
    PP.physics.set_world_bounds(scene, 0, 0, LARGHEZZA_MONDO, ALTEZZA_SCHERMO);
    GameCamera.inizializza(scene, LARGHEZZA_MONDO, ALTEZZA_SCHERMO);
}

function crea_sfondo(scene) {
    PP.assets.image.add(scene, assets.sfondo, SFONDO_X, SFONDO_Y, SFONDO_ORIGINE, SFONDO_ORIGINE);
}

function crea_pavimento(scene) {
    const altezza_pavimento = ALTEZZA_SCHERMO - PAVIMENTO_Y;
    const pavimento = PP.shapes.rectangle_add(scene, LARGHEZZA_MONDO / 2, PAVIMENTO_Y + altezza_pavimento / 2, LARGHEZZA_MONDO, altezza_pavimento, PAVIMENTO_COLORE, PAVIMENTO_ALPHA );
    PP.physics.add(scene, pavimento, PP.physics.type.STATIC);
    return pavimento;
}

function crea_porte(scene) {
    const porta1 = Porte.crea(scene, PORTA_1_X, PAVIMENTO_Y, PORTA_1_DESTINAZIONE);
    const porta2 = Porte.crea(scene, PORTA_2_X, PAVIMENTO_Y, PORTA_2_DESTINAZIONE);
    const porta3 = Porte.crea(scene, PORTA_3_X, PAVIMENTO_Y, PORTA_3_DESTINAZIONE);
    const porta4 = Porte.crea(scene, PORTA_4_X, PAVIMENTO_Y, PORTA_4_DESTINAZIONE);
    return [porta1, porta2, porta3, porta4];
}

function crea_giocatore(scene, pavimento, porte) {
    goody = Goody.inizializza(scene, SPAWN_X, PAVIMENTO_Y, PUO_SALTARE, SPAWN_DIREZIONE);
    PP.physics.add_collider(scene, goody, pavimento);
    Porte.calcola_vicinanza_porta(scene, goody, porte);
}

function imposta_camera(scene) {
    GameCamera.segui(scene, goody);
}

function preload(scene) {
    Goody.carica(scene);
    assets.sfondo = PP.assets.image.load(scene, SFONDO);
}

function create(scene) {
    imposta_mondo(scene);
    crea_sfondo(scene);
    const pavimento = crea_pavimento(scene);
    const porte = crea_porte(scene);
    crea_giocatore(scene, pavimento, porte);
    imposta_camera(scene);
}

function update(scene) {
    PP.game_state.set_variable("GoodyXstanza", goody.geometry.x);
    PP.game_state.set_variable("stanzaPreSwap", NOME);
    Goody.aggiorna(scene, goody, DESTINAZIONE_OCCHIALI);
    Porte.gestisci_interazione(scene, goody);
}

function destroy(scene) {
}

PP.scenes.add(NOME, preload, create, update, destroy);
