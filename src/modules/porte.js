import * as Goody from "./goody.js";
import * as GameCamera from "./camera.js";

const LARGHEZZA_PORTA = 190;
const ALTEZZA_PORTA = 370;
const COLORE_PORTA = "0xFFFFFF";
const ALPHA_PORTA = 0;

const DURATA_APERTURA_MS = 0;
const ZOOM_APERTURA = 1;

let porta_vicina = null;
let porta_da_aprire = null;

export function crea(scene, x, y, destinazione) {
    const porta = PP.shapes.rectangle_add(scene, x, y - ALTEZZA_PORTA / 2, LARGHEZZA_PORTA, ALTEZZA_PORTA, COLORE_PORTA, ALPHA_PORTA);
    PP.physics.add(scene, porta, PP.physics.type.STATIC);
    porta.scena_destinazione = destinazione;
    porta.in_transizione = false;
    return porta;
}

export function calcola_vicinanza_porta(scene, player, porte) {
    porta_vicina = null;
    for (const porta of porte) {
        PP.physics.add_overlap_f(scene, player, porta, ricorda_porta_vicina);
    }
}

function ricorda_porta_vicina(scene, giocatore, porta) {
    porta_vicina = porta;
}

function cambia_scena(scene) {
    PP.scenes.start(porta_da_aprire.scena_destinazione);
}

export function animazione_apertura(scene) {
    GameCamera.zoom(scene, ZOOM_APERTURA, DURATA_APERTURA_MS);
    PP.timers.add_timer(scene, DURATA_APERTURA_MS, cambia_scena, false); //un pocinino di tempo per animare goody che interagisce
}

function apri_porta(scene) {
    if (porta_da_aprire.in_transizione || porta_da_aprire.scena_destinazione === null) return;
    porta_da_aprire.in_transizione = true;
    animazione_apertura(scene);
}

export function gestisci_interazione(scene, player) {
    const porta = porta_vicina;
    porta_vicina = null;
    if (porta) {
        porta_da_aprire = porta;
        Goody.interagisci(scene, player, apri_porta);
    }
}
