import * as GameCamera from "./camera.js";

const PERCORSO_SPRITE = "./resources/imgs/personaggio/goody.png";
const FRAME_LARGHEZZA = 222;
const FRAME_ALTEZZA = 360;
const ORIGINE_X = 0.5;
const ORIGINE_Y = 1;

const HITBOX_LARGHEZZA = 70;
const HITBOX_ALTEZZA = 340;
const HITBOX_OFFSET_X = 67;
const HITBOX_OFFSET_Y = 20;

const VELOCITA_MAX = 320;
const ACCELERAZIONE_TERRA = 2400;
const ACCELERAZIONE_ARIA = 1400;
const MOLTIPLICATORE_INVERSIONE = 2;
const ATTRITO_TERRA = 2600;
const ATTRITO_ARIA = 500;

const FORZA_SALTO = 560;
const TAGLIO_SALTO = 0.5;
const VELOCITA_CADUTA_MAX = 900;

const DURATA_INTERAZIONE_MS = 250;
const SOGLIA_VELOCITA_CAMMINATA = 20;

const TASTO_DESTRA = PP.key_codes.D;
const TASTO_SINISTRA = PP.key_codes.A;
const TASTO_SALTO = PP.key_codes.SPACE;
const TASTO_INTERAZIONE = PP.key_codes.E;
const TASTO_OCCHIALI = PP.key_codes.G;

const ANIM_FERMO_NOME = "goody_fermo";
const ANIM_FERMO_FRAMES = [0];
const ANIM_FERMO_FRAME_RATE = 1;
const ANIM_FERMO_RIPETI = -1;

const ANIM_CAMMINA_NOME = "goody_cammina";
const ANIM_CAMMINA_FRAMES = Array.from({ length: 20 }, (_, i) => i);

const ANIM_CAMMINA_FRAME_RATE = 20;
const ANIM_CAMMINA_RIPETI = -1;

const ANIM_SALTA_NOME = "goody_salta";
const ANIM_SALTA_FRAMES = [0];
const ANIM_SALTA_FRAME_RATE = 1;
const ANIM_SALTA_RIPETI = -1;

const ANIM_CADE_NOME = "goody_cade";
const ANIM_CADE_FRAMES = [0];
const ANIM_CADE_FRAME_RATE = 1;
const ANIM_CADE_RIPETI = -1;

const ANIM_INTERAGISCE_NOME = "goody_interagisce";
const ANIM_INTERAGISCE_FRAMES = [0];
const ANIM_INTERAGISCE_FRAME_RATE = 6;
const ANIM_INTERAGISCE_RIPETI = 0;

export let asset;
let giocatore_in_interazione = null;

function aggiungi_animazione(scene, player, nome, frames, frame_rate, ripeti) {
    if (scene.anims.exists(nome)) {
        player.list_of_animations.push(nome);
    } else {
        PP.assets.sprite.animation_add_list(player, nome, frames, frame_rate, ripeti);
    }
}

function crea_animazioni(scene, player) {
    aggiungi_animazione(scene, player, ANIM_FERMO_NOME, ANIM_FERMO_FRAMES, ANIM_FERMO_FRAME_RATE, ANIM_FERMO_RIPETI);
    aggiungi_animazione(scene, player, ANIM_CAMMINA_NOME, ANIM_CAMMINA_FRAMES, ANIM_CAMMINA_FRAME_RATE, ANIM_CAMMINA_RIPETI);
    aggiungi_animazione(scene, player, ANIM_SALTA_NOME, ANIM_SALTA_FRAMES, ANIM_SALTA_FRAME_RATE, ANIM_SALTA_RIPETI);
    aggiungi_animazione(scene, player, ANIM_CADE_NOME, ANIM_CADE_FRAMES, ANIM_CADE_FRAME_RATE, ANIM_CADE_RIPETI);
    aggiungi_animazione(scene, player, ANIM_INTERAGISCE_NOME, ANIM_INTERAGISCE_FRAMES, ANIM_INTERAGISCE_FRAME_RATE, ANIM_INTERAGISCE_RIPETI);
}

function riproduci_animazione(player, nome) {
    if (player.animazione_corrente === nome) return;

    player.animazione_corrente = nome;
    PP.assets.sprite.animation_play(player, nome);
}

export function anima(scene, player) {
    const guarda_a_sinistra = player.direzione < 0;
    if (player.geometry.flip_x !== guarda_a_sinistra) {
        player.geometry.flip_x = guarda_a_sinistra;
        aggiorna_hitbox(player);
    }

    const a_terra = PP.physics.is_on_ground(player);
    const vx = PP.physics.get_velocity_x(player);
    const vy = PP.physics.get_velocity_y(player);

    let animazione = ANIM_FERMO_NOME;

    if (player.interagendo) {
        animazione = ANIM_INTERAGISCE_NOME;
    } else if (!a_terra) {
        if (vy < 0) {
            animazione = ANIM_SALTA_NOME;
        } else {
            animazione = ANIM_CADE_NOME;
        }
    } else if (Math.abs(vx) > SOGLIA_VELOCITA_CAMMINATA) {
        animazione = ANIM_CAMMINA_NOME;
    }

    riproduci_animazione(player, animazione);
}

export function carica(scene) {
    asset = PP.assets.sprite.load_spritesheet(scene, PERCORSO_SPRITE, FRAME_LARGHEZZA, FRAME_ALTEZZA);
    return asset;
}

export function inizializza(scene, x, y, puo_saltare, direzione) {
    const player = PP.assets.sprite.add(scene, asset, x, y, ORIGINE_X, ORIGINE_Y);
    PP.physics.add(scene, player, PP.physics.type.DYNAMIC);

    player.puo_saltare = puo_saltare;
    player.direzione = direzione;
    player.geometry.flip_x = direzione < 0;
    player.interagendo = false;
    player.animazione_corrente = null;

    imposta_fisica(scene, player);
    crea_animazioni(scene, player);
    aggiorna_hitbox(player);
    riproduci_animazione(player, ANIM_FERMO_NOME);

    return player;
}

function aggiorna_hitbox(player) {
    let offset_x = HITBOX_OFFSET_X;
    if (player.geometry.flip_x) {
        offset_x = FRAME_LARGHEZZA - (HITBOX_OFFSET_X + HITBOX_LARGHEZZA);
    }

    PP.physics.set_collision_rectangle(player, HITBOX_LARGHEZZA, HITBOX_ALTEZZA, offset_x, HITBOX_OFFSET_Y);
}

export function imposta_fisica(scene, player) {
    PP.physics.set_allow_gravity(player, true);
    PP.physics.set_bounce_x(player, 0);
    PP.physics.set_bounce_y(player, 0);
    PP.physics.set_drag_x(player, ATTRITO_TERRA);
    PP.physics.set_collide_world_bounds(player, true);
}

export function muovi(scene, player) {
    if (player.interagendo) {
        PP.physics.set_acceleration_x(player, 0);
        return;
    }
    const a_terra = PP.physics.is_on_ground(player);
    let direzione = 0;
    
    if (PP.interactive.kb.is_key_down(scene, TASTO_DESTRA)) {
        direzione = direzione + 1;
    }
    else if (PP.interactive.kb.is_key_down(scene, TASTO_SINISTRA)) {
        direzione = direzione - 1;
    }
    else{
        PP.physics.set_acceleration_x(player, 0);
        return;
    }

    let accelerazione = ACCELERAZIONE_ARIA;
    if (a_terra) {
        accelerazione = ACCELERAZIONE_TERRA;
    }

    const velocita = PP.physics.get_velocity_x(player);
    if (velocita * direzione < 0) {
        accelerazione = accelerazione * MOLTIPLICATORE_INVERSIONE;
    }

    PP.physics.set_acceleration_x(player, direzione * accelerazione);
    player.direzione = direzione;
}

export function salta(scene, player) {
    if (!player.puo_saltare || player.interagendo) return;

    if (PP.interactive.kb.is_key_just_down(scene, TASTO_SALTO) && PP.physics.is_on_ground(player)) {
        PP.physics.set_velocity_y(player, -FORZA_SALTO);
    }

    if (PP.interactive.kb.is_key_just_up(scene, TASTO_SALTO)) {
        const vy = PP.physics.get_velocity_y(player);
        if (vy < 0) {
            PP.physics.set_velocity_y(player, vy * TAGLIO_SALTO);
        }
    }
}

export function aggiorna_fisica(scene, player) {
    if (PP.physics.is_on_ground(player)) {
        PP.physics.set_drag_x(player, ATTRITO_TERRA);
    } else {
        PP.physics.set_drag_x(player, ATTRITO_ARIA);
    }

    const vx = PP.physics.get_velocity_x(player);
    if (Math.abs(vx) > VELOCITA_MAX) {
        PP.physics.set_velocity_x(player, Math.sign(vx) * VELOCITA_MAX);
    }

    const vy = PP.physics.get_velocity_y(player);
    if (vy > VELOCITA_CADUTA_MAX) {
        PP.physics.set_velocity_y(player, VELOCITA_CADUTA_MAX);
    }
}

export function mettiOcchiali(scene, player, destinazione) {
    if (!destinazione) return;

    if (PP.interactive.kb.is_key_just_down(scene, TASTO_OCCHIALI)) {
        riproduci_animazione(player, ANIM_INTERAGISCE_NOME);
        PP.scenes.start(destinazione);
    }
}

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

export function gestisci_camera(scene, player) {
    GameCamera.peek(scene);
}

export function aggiorna(scene, player, destinazione) {
    muovi(scene, player);
    salta(scene, player);
    aggiorna_fisica(scene, player);
    anima(scene, player);
    gestisci_camera(scene, player);
    mettiOcchiali(scene, player, destinazione);
}
