import * as Goody from "../modules/goody.js";
import * as Porte from "../modules/porte.js";
import * as Bordi from "../modules/bordi.js";
import * as GameCamera from "../modules/camera.js";
import * as Hud from "../modules/hud.js";
import * as Parallasse from "../modules/parallasse.js";

const ALTEZZA_SCHERMO = 720;

const NOME = "stanza_goody";

const SFONDO = "./resources/imgs/ambienti/stanza_goody/stanza_goody.png";
const PRIMO_PIANO = "./resources/imgs/ambienti/stanza_da_letto/stanza_genitori_colori_primo_piano.png"; //da cambiare quando avremo il primo piano della stanza
const LARGHEZZA_MONDO = 1676;

const SFONDO_X = 0;
const SFONDO_Y = 0;
const SFONDO_ORIGINE = 0;

const PRIMO_PIANO_Y = 0;
const PRIMO_PIANO_Z_INDEX = 10;

const PAVIMENTO_Y = 600;
const PAVIMENTO_COLORE = "0x000000";
const PAVIMENTO_ALPHA = 0;

const BORDO_SINISTRO_X = 120;
const BORDO_DESTRO_X = LARGHEZZA_MONDO-430;

const PUO_SALTARE = false;
const SPAWN_X = 150;
const SPAWN_DIREZIONE = 1;

const DESTINAZIONE_OCCHIALI = "stanza_goodyBN";

const PORTA_1_X = 130;
const PORTA_1_DESTINAZIONE = "corridoio";

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

function crea_bordi(scene) {
    return Bordi.crea(scene, BORDO_SINISTRO_X, BORDO_DESTRO_X, ALTEZZA_SCHERMO);
}

function crea_porte(scene) {
    const porta1 = Porte.crea(scene, PORTA_1_X, PAVIMENTO_Y, PORTA_1_DESTINAZIONE);
    return [porta1];
}

function crea_giocatore(scene, pavimento, porte, bordi) {
    if(PP.game_state.get_variable("stanzaPreSwap") && PP.game_state.get_variable("stanzaPreSwap") === "stanza_goodyBN"){
        goody = Goody.inizializza(scene, PP.game_state.get_variable("GoodyXstanza"), PAVIMENTO_Y, PUO_SALTARE, PP.game_state.get_variable("GoodyDirezione"));
    }
    else{
        goody = Goody.inizializza(scene, SPAWN_X, PAVIMENTO_Y, PUO_SALTARE, SPAWN_DIREZIONE);
    }
    PP.physics.add_collider(scene, goody, pavimento);
    for (const bordo of bordi) {
        PP.physics.add_collider(scene, goody, bordo);
    }
    Porte.attiva_rilevamento_porte(scene, goody, porte);
}

function imposta_camera(scene) {
    GameCamera.segui(scene, goody);
}

function crea_primo_piano(scene) {
    Parallasse.crea_primo_piano(scene, assets.primo_piano, PRIMO_PIANO_Y, PRIMO_PIANO_Z_INDEX, LARGHEZZA_MONDO);
}

function preload(scene) {
    Goody.carica(scene);
    Hud.inizializza_HUD(scene);
    assets.sfondo = PP.assets.image.load(scene, SFONDO);
    assets.primo_piano = PP.assets.image.load(scene, PRIMO_PIANO);
}

function create(scene) {
    Hud.visualizza_HUD(scene);
    imposta_mondo(scene);
    crea_sfondo(scene);
    crea_primo_piano(scene);
    const pavimento = crea_pavimento(scene);
    const bordi = crea_bordi(scene);
    const porte = crea_porte(scene);
    crea_giocatore(scene, pavimento, porte, bordi);
    imposta_camera(scene);
}

function update(scene) {
    Hud.aggiorna_HUD(scene);
    Parallasse.aggiorna_parallasse(scene);
    PP.game_state.set_variable("GoodyXstanza", goody.geometry.x);
    PP.game_state.set_variable("GoodyDirezione", goody.direzione);
    PP.game_state.set_variable("stanzaPreSwap", NOME);
    Goody.aggiorna(scene, goody, DESTINAZIONE_OCCHIALI);
    Porte.gestisci_interazione_porta(scene, goody);
}

function destroy(scene) {
}

PP.scenes.add(NOME, preload, create, update, destroy);
