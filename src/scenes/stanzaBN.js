import * as Goody from "../modules/goody.js";
import * as Porte from "../modules/porte.js";
import * as GameCamera from "../modules/camera.js";

const LARGHEZZA_SCHERMO = 1280;
const ALTEZZA_SCHERMO = 720;

const NOME = "stanzaBN";

const SFONDO = "./resources/imgs/ambienti/stanza_da_letto/stanza_genitori_bn.jpg";
const PRIMO_PIANO = "./resources/imgs/ambienti/stanza_da_letto/stanza_genitori_bn_primo_piano.png";
const LARGHEZZA_MONDO = 1978;

const SFONDO_X = 0;
const SFONDO_Y = 0;
const SFONDO_ORIGINE = 0;

const PRIMO_PIANO_Y = 0;
const PRIMO_PIANO_ORIGINE = 0;
const PRIMO_PIANO_Z_INDEX = 10;
const PARALLASSE_PRIMO_PIANO = 1.25;

const PAVIMENTO_Y = 600;
const PAVIMENTO_COLORE = "0x000000";
const PAVIMENTO_ALPHA = 0;

const PUO_SALTARE = false;
const SPAWN_X = 150;
const SPAWN_DIREZIONE = 1;

const DESTINAZIONE_OCCHIALI = "stanza";

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

function crea_porte(scene) {
    const porta1 = Porte.crea(scene, PORTA_1_X, PAVIMENTO_Y, PORTA_1_DESTINAZIONE);
    return [porta1];
}

function crea_giocatore(scene, pavimento, porte) {
    if(PP.game_state.get_variable("stanzaPreSwap") && PP.game_state.get_variable("stanzaPreSwap") === "stanza"){
        goody = Goody.inizializza(scene, PP.game_state.get_variable("GoodyXstanza"), PAVIMENTO_Y, PUO_SALTARE, PP.game_state.get_variable("GoodyDirezione"));
    }
    else{
        goody = Goody.inizializza(scene, SPAWN_X, PAVIMENTO_Y, PUO_SALTARE, SPAWN_DIREZIONE);
    }
    PP.physics.add_collider(scene, goody, pavimento);
    Porte.calcola_vicinanza_porta(scene, goody, porte);
}

function imposta_camera(scene) {
    GameCamera.segui(scene, goody);
}

function crea_primo_piano(scene) {
    const scroll_centrale = (LARGHEZZA_MONDO - LARGHEZZA_SCHERMO) / 2;
    const primo_piano = PP.assets.image.add(scene, assets.primo_piano, (PARALLASSE_PRIMO_PIANO - 1) * scroll_centrale, PRIMO_PIANO_Y, PRIMO_PIANO_ORIGINE, PRIMO_PIANO_ORIGINE );
    primo_piano.tile_geometry.scroll_factor_x = PARALLASSE_PRIMO_PIANO;

    const layer_primo_piano = PP.layers.create(scene);
    PP.layers.add_to_layer(layer_primo_piano, primo_piano);
    PP.layers.set_z_index(layer_primo_piano, PRIMO_PIANO_Z_INDEX);
}

function preload(scene) {
    Goody.carica(scene);
    assets.sfondo = PP.assets.image.load(scene, SFONDO);
    assets.primo_piano = PP.assets.image.load(scene, PRIMO_PIANO);
}

function create(scene) {
    imposta_mondo(scene);
    crea_sfondo(scene);
    const pavimento = crea_pavimento(scene);
    const porte = crea_porte(scene);
    crea_giocatore(scene, pavimento, porte);
    imposta_camera(scene);
    crea_primo_piano(scene);
}

function update(scene) {
    PP.game_state.set_variable("GoodyXstanza", goody.geometry.x);
    PP.game_state.set_variable("GoodyDirezione", goody.direzione);
    PP.game_state.set_variable("stanzaPreSwap", NOME);
    Goody.aggiorna(scene, goody, DESTINAZIONE_OCCHIALI);
    Porte.gestisci_interazione(scene, goody);
}

function destroy(scene) {
}

PP.scenes.add(NOME, preload, create, update, destroy);
