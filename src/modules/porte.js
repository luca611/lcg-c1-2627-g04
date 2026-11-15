import * as Goody from "./goody.js";

const LARGHEZZA_PORTA = 190;
const ALTEZZA_PORTA = 370;
const COLORE_PORTA = "0xFFFFFF";
const ALPHA_PORTA = 0;

let porta_sovrapposta = null;
let porta_scelta = null;

export function crea(scene, x, y, destinazione) {
    let porta = PP.shapes.rectangle_add(scene, x, y - ALTEZZA_PORTA / 2, LARGHEZZA_PORTA, ALTEZZA_PORTA, COLORE_PORTA, ALPHA_PORTA);
    PP.physics.add(scene, porta, PP.physics.type.STATIC);
    porta.scena_destinazione = destinazione;
    porta.in_transizione = false;
    return porta;
}

/*
    il rilevamento viene comodo cosi non ho bisogno ogni volta di mandate tutte le porte ma le 
    invio una volta e poi chiamano loro la funzione di aggiornamento quando goody è sopra di essa
    e si occupano di modificare l'interazione 
*/

export function attiva_rilevamento_porte(scene, player, porte) {
    porta_sovrapposta = null;
    for (let porta of porte) {
        PP.physics.add_overlap_f(scene, player, porta, segna_ultima_porta);
    }
}

function segna_ultima_porta(scene, giocatore, porta) {
    porta_sovrapposta = porta;
}

function cambia_scena(scene) {
    if (!porta_scelta || porta_scelta.scena_destinazione == null) return;
    PP.scenes.start(porta_scelta.scena_destinazione);
}

export function gestisci_interazione_porta(scene, player) {
    let porta = porta_sovrapposta;
    porta_sovrapposta = null;
    if (porta) {
        porta_scelta = porta;
        Goody.interagisci(scene, player, cambia_scena);
    }
}
