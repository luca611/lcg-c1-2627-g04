import * as Camera from "./camera.js";
import { TASTO_DESTRA, TASTO_SINISTRA, TASTO_SALTO, TASTO_INTERAZIONE, TASTO_OCCHIALI } from "../utils/tasti.js";

const PERCORSO_SPRITE = "./resources/imgs/personaggio/goody.png";
const FRAME_LARGHEZZA = 222;
const FRAME_ALTEZZA = 360;
const ORIGINE_X = 0.5;
const ORIGINE_Y = 1;

const HITBOX_LARGHEZZA = 70;
const HITBOX_ALTEZZA = 340;
const HITBOX_OFFSET_X = 70;
const HITBOX_OFFSET_Y = 20;

const VELOCITA_MAX = 320;
const ACCELERAZIONE_TERRA = 2400;
const ACCELERAZIONE_ARIA = 1400;
const MOLTIPLICATORE_INVERSIONE = 2;
const ATTRITO_TERRA = 2600;
const ATTRITO_ARIA = 500;

const FORZA_SALTO = 660;
const TAGLIO_SALTO = 0.5;
const VELOCITA_CADUTA_MAX = 900;

const DURATA_INTERAZIONE_MS = 250;

const ANIMAZIONE_INFINITA = -1;
const FRAME_RATE_ANIMAZIONI = 20;

const ANIM_FERMO_NOME = "goody_fermo";
const ANIM_FERMO_FRAMES = [8]

const ANIM_CAMMINA_NOME = "goody_cammina";
const ANIM_CAMMINA_FRAMES = Array.from({ length: 20 }, (_, i) => i);

const ANIM_SALTA_NOME = "goody_salta";
const ANIM_SALTA_FRAMES = [0];

const ANIM_CADE_NOME = "goody_cade";
const ANIM_CADE_FRAMES = [0];

const ANIM_INTERAGISCE_NOME = "goody_interagisce";
const ANIM_INTERAGISCE_FRAMES = [0];


export let asset;
let giocatore_in_interazione = null;

// FUNZIONI DI ANIMAZIONE DI GOODY
function aggiungi_animazione(scene, player, nome, frames, frame_rate, ripeti) {
    if (scene.anims.exists(nome)) {
        player.list_of_animations.push(nome);
    } else {
        PP.assets.sprite.animation_add_list(player, nome, frames, frame_rate, ripeti);
    }
}

function crea_animazioni(scene, player) {
    aggiungi_animazione(scene, player, ANIM_FERMO_NOME, ANIM_FERMO_FRAMES, FRAME_RATE_ANIMAZIONI, ANIMAZIONE_INFINITA);
    aggiungi_animazione(scene, player, ANIM_CAMMINA_NOME, ANIM_CAMMINA_FRAMES, FRAME_RATE_ANIMAZIONI, ANIMAZIONE_INFINITA);
    aggiungi_animazione(scene, player, ANIM_SALTA_NOME, ANIM_SALTA_FRAMES, FRAME_RATE_ANIMAZIONI, ANIMAZIONE_INFINITA);
    aggiungi_animazione(scene, player, ANIM_CADE_NOME, ANIM_CADE_FRAMES, FRAME_RATE_ANIMAZIONI, ANIMAZIONE_INFINITA);
    aggiungi_animazione(scene, player, ANIM_INTERAGISCE_NOME, ANIM_INTERAGISCE_FRAMES, FRAME_RATE_ANIMAZIONI, 0);
}

function riproduci_animazione(player, nome) {
    if (player.animazione_corrente === nome) return;

    console.log("animazione: "+nome)
    player.animazione_corrente = nome;
    PP.assets.sprite.animation_play(player, nome);
}

export function anima(scene, player) { 
    let guarda_a_sinistra = player.direzione < 0;
    if (player.geometry.flip_x !== guarda_a_sinistra) {
        player.geometry.flip_x = guarda_a_sinistra;
        aggiorna_hitbox(player);
    }

    let a_terra = PP.physics.is_on_ground(player);
    let vx = PP.physics.get_velocity_x(player);
    let vy = PP.physics.get_velocity_y(player);

    let animazione = ANIM_FERMO_NOME;
    if (player.interagendo) {
        animazione = ANIM_INTERAGISCE_NOME;
    } else if (!a_terra) {
        animazione = vy<0 ? ANIM_SALTA_NOME: ANIM_CADE_NOME;
    } else if (vx != 0) {
        animazione = ANIM_CAMMINA_NOME;
    }

    riproduci_animazione(player, animazione);
}

// FUNZIONI DI CREAZIONE
export function carica(scene) {
    asset = PP.assets.sprite.load_spritesheet(scene, PERCORSO_SPRITE, FRAME_LARGHEZZA, FRAME_ALTEZZA);
    return asset;
}

export function inizializza(scene, x, y, puo_saltare, direzione) {
    let player = PP.assets.sprite.add(scene, asset, x, y, ORIGINE_X, ORIGINE_Y);
    PP.physics.add(scene, player, PP.physics.type.DYNAMIC);

    player.puo_saltare = puo_saltare;
    player.direzione = direzione;
    player.geometry.flip_x = direzione < 0; //mettere una condizione assegna alla variabile il risultayo booleano
    player.interagendo = false;
    player.animazione_corrente = null;

    //parametri che vengono modificati dalle piattaforme scivolose / appiccicose
    player.moltiplicatore_attrito = 1;
    player.moltiplicatore_accelerazione = 1;
    player.salto_bloccato = false;
    player.lanciato_da_molla = false;

    imposta_fisica(scene, player);
    crea_animazioni(scene, player);
    aggiorna_hitbox(player);
    riproduci_animazione(player, ANIM_FERMO_NOME);

    return player;
}

export function imposta_fisica(scene, player) {
    PP.physics.set_allow_gravity(player, true);
    PP.physics.set_collide_world_bounds(player, true);
}

// FUNZIONI INFORMAZIONI HITBOX

function aggiorna_hitbox(player) {
    let offset_x = HITBOX_OFFSET_X;
    if (player.geometry.flip_x) {
        offset_x = FRAME_LARGHEZZA - (HITBOX_OFFSET_X + HITBOX_LARGHEZZA);
    }

    PP.physics.set_collision_rectangle(player, HITBOX_LARGHEZZA, HITBOX_ALTEZZA, offset_x, HITBOX_OFFSET_Y);
}

// FUNZIONI DI MOVIMENTO
export function muovi(scene, player) {
    if (player.interagendo) {
        PP.physics.set_acceleration_x(player, 0);
        return;
    }
    
    if (PP.interactive.kb.is_key_down(scene, TASTO_DESTRA)) {
        player.direzione = 1;
    }
    else if (PP.interactive.kb.is_key_down(scene, TASTO_SINISTRA)) {
        player.direzione = -1;
    }
    else{
        PP.physics.set_acceleration_x(player, 0);
        return;
    }

    let accelerazione = ACCELERAZIONE_ARIA;
    if (PP.physics.is_on_ground(player)) {
        accelerazione = ACCELERAZIONE_TERRA * player.moltiplicatore_accelerazione;
    }

    let velocita = PP.physics.get_velocity_x(player);
    if (velocita * player.direzione < 0) {
        accelerazione = accelerazione * MOLTIPLICATORE_INVERSIONE;
    }

    PP.physics.set_acceleration_x(player,  player.direzione * accelerazione);
}

export function salta(scene, player) {
    if (!player.puo_saltare || player.interagendo || player.salto_bloccato) return;

    if (PP.interactive.kb.is_key_just_down(scene, TASTO_SALTO) && PP.physics.is_on_ground(player)) {
        PP.physics.set_velocity_y(player, -FORZA_SALTO );
    }

    if (PP.interactive.kb.is_key_just_up(scene, TASTO_SALTO)) {
        let vy = PP.physics.get_velocity_y(player);
        if (vy < 0 && !player.lanciato_da_molla) {
            PP.physics.set_velocity_y(player, vy * TAGLIO_SALTO);
        }
    }
}

export function aggiorna_fisica(scene, player) {
    let a_terra = PP.physics.is_on_ground(player);
    let velocita_x = PP.physics.get_velocity_x(player);
    let velocita_y = PP.physics.get_velocity_y(player);

    if (a_terra) {
        let attrito = ATTRITO_TERRA * player.moltiplicatore_attrito;
        PP.physics.set_drag_x(player, attrito);
        player.lanciato_da_molla = false;
    } else {
        PP.physics.set_drag_x(player, ATTRITO_ARIA);
    }

    if (velocita_x > VELOCITA_MAX || velocita_x < -VELOCITA_MAX) {
        PP.physics.set_velocity_x(player, player.direzione * VELOCITA_MAX);
    }
    if (velocita_y > VELOCITA_CADUTA_MAX) {
        PP.physics.set_velocity_y(player, VELOCITA_CADUTA_MAX);
    }
}

export function metti_occhiali(scene, player, destinazione) {
    if (!destinazione) return;

    if (PP.interactive.kb.is_key_just_down(scene, TASTO_OCCHIALI)) {
        riproduci_animazione(player, ANIM_INTERAGISCE_NOME);
        PP.scenes.start(destinazione);
    }
}

// FUNZIONI INTERAZIONE OGGETTI
export function interagisci(scene, player, funzione) {
    if (player.interagendo) return false;
    if (!PP.interactive.kb.is_key_just_down(scene, TASTO_INTERAZIONE)) return false;
    if (!PP.physics.is_on_ground(player)) return false;

    player.interagendo = true;
    player.funzione_dopo_interazione = funzione;
    giocatore_in_interazione = player;

    PP.physics.set_acceleration_x(player, 0);
    PP.physics.set_velocity_x(player, 0);
    riproduci_animazione(player, ANIM_INTERAGISCE_NOME);

    PP.timers.add_timer(scene, DURATA_INTERAZIONE_MS, finisci_interazione, false);

    return true;
}

function finisci_interazione(scene) {
    giocatore_in_interazione.interagendo = false;
    giocatore_in_interazione.funzione_dopo_interazione(scene);
}

export function aggiorna(scene, player, destinazione) {
    muovi(scene, player);
    salta(scene, player);
    aggiorna_fisica(scene, player);
    anima(scene, player);
    Camera.gestisci_sbircio(scene);
    metti_occhiali(scene, player, destinazione);
    console.log("x: "+player.geometry.x+" y: "+player.geometry.y)
}
