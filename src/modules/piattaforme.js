const COLORE_HITBOX = "0x000000";
const ALPHA_HITBOX = 0;
const COLORE_MOLLA = "0xFF0000";
const ALPHA_MOLLA = 0;
const COLORE_ATTRITO = "0x00FF00";
const ALPHA_ATTRITO = 0;
const ALTEZZA_ZONA_ATTRITO = 20;

const SPESSORE = 12;
const GRADINI_DEFAULT = 40;

const FORZA_MOLLA_DEFAULT = 1650;
const MOLLA_LARGHEZZA = 60;
const MOLLA_ALTEZZA = 40;
const MOLLA_SPORGENZA = 30;

const SCIVOLOSO_ATTRITO = 0.08;
const SCIVOLOSO_ACCELERAZIONE = 0.35;
const APPICCICOSO_ATTRITO = 1;
const APPICCICOSO_ACCELERAZIONE = 0.45;

/*  
    OBBLIGATORI:
    x, y        centro della piattaforma
    lunghezza   larghezza della piattaforma in pixel    
    OPZIONALI:
    angolo      inclinazione
    gradini     quanti step deve avere la piattaforma se inclinata
    attrito     { tipo, da, a } appiccicoso o scivoloso e percentuale da a (0,1).  (sempre piatta e ferma: l'angolo viene ignorato)
    salto       { x, y, forza } 
    mobile      { da, a, velocita }  (sempre orizzontale/piatta: l'angolo viene ignorato)
    immagine    percorso oppure  { percorso, offset_x, offset_y }
*/
export function crea_piattaforma(scena, opzioni) {

    let angolo = opzioni.angolo !== undefined ? opzioni.angolo : 0;
    if (opzioni.mobile || opzioni.attrito) angolo = 0;
    let gradini = opzioni.gradini !== undefined ? opzioni.gradini : GRADINI_DEFAULT;

    let piattaforma = {
        x: opzioni.x,
        y: opzioni.y,
        lunghezza: opzioni.lunghezza,
        angolo: angolo,
        attrito: opzioni.attrito,
        mobile: opzioni.mobile,
        molla: null,
        zona_attrito: null,
        immagine: null
    };

    if (piattaforma.mobile) {
        piattaforma.x = piattaforma.mobile.da.x;
        piattaforma.y = piattaforma.mobile.da.y;
        piattaforma.mobile.avanzamento = 0;
        piattaforma.mobile.direzione = 1;
    }

    piattaforma.geometry = { x: piattaforma.x, y: piattaforma.y + SPESSORE / 2 };
    
    // SE QUALCUNO OLTRE A ME STA GUARDANDO IL CODICE SE HA VOGLIA SI POSSONO FRAMMENTARE QUESTE SEZIONI COMMENTATE IN SOTTO FUNZIONI PER 
    // MIGLIORARE LA LEGGIBILITA'
    
    // qui festisco se è mobile
    let fisica = PP.physics.type.STATIC;
    if (piattaforma.mobile) fisica = PP.physics.type.DYNAMIC;

    // qui gestisco se è obliqua
    if (angolo === 0) {
        crea_hitbox_obliqua(scena, piattaforma, piattaforma.lunghezza, 1, 0, SPESSORE, fisica);
    } else {
        crea_hitbox_obliqua(scena, piattaforma, piattaforma.lunghezza, gradini, angolo, SPESSORE, fisica);
    }

    for (let hitbox of piattaforma.hitbox) {
        if (piattaforma.mobile) rendi_mobile(hitbox);
    }

    // Se ha un'immagine
    if (opzioni.immagine) {
        piattaforma.immagine = crea_immagine(scena, piattaforma, opzioni.immagine);
    }

    // Se ha una molla sopra
    if (opzioni.salto) {
        let salto = opzioni.salto;
        let centro_y = salto.y - MOLLA_SPORGENZA + MOLLA_ALTEZZA / 2;
        let zona = PP.shapes.rectangle_add(scena, salto.x, centro_y, MOLLA_LARGHEZZA, MOLLA_ALTEZZA, COLORE_MOLLA, ALPHA_MOLLA);

        PP.physics.add(scena, zona, fisica);
        if (piattaforma.mobile) rendi_mobile(zona);

        zona.forza = salto.forza ? salto.forza : FORZA_MOLLA_DEFAULT; 
        piattaforma.molla = zona;
    }

    // Se ha una zona con attrito speciale (ghiaccio o colla)
    if (opzioni.attrito) {
        piattaforma.zona_attrito = crea_zona_attrito(scena, piattaforma, opzioni.attrito);
    }

    return piattaforma;
}

export function crea_piattaforme(scena, dati_piattaforme) {
    let piattaforme = [];
    for (let piattaforma of dati_piattaforme) {
        piattaforme.push(crea_piattaforma(scena, piattaforma));
    }
    return piattaforme;
}

// IMMAGINI DELLE PIATTAFORME

function leggi_dati_immagine(immagine) {
    if (typeof immagine === "string") immagine = { percorso: immagine };
    return {
        percorso: immagine.percorso,
        offset_x: immagine.offset_x !== undefined ? immagine.offset_x : 0,
        offset_y: immagine.offset_y !== undefined ? immagine.offset_y : 0,
    };
}

export function carica_immagini_piattaforme(scena, dati_piattaforme) {
    scena.immagini_piattaforme = {};
    for (let dati of dati_piattaforme) {
        if (!dati.immagine) continue;
        let percorso = leggi_dati_immagine(dati.immagine).percorso;
        if (!scena.immagini_piattaforme[percorso]) {
            scena.immagini_piattaforme[percorso] = PP.assets.image.load(scena, percorso);
        }
    }
}

function crea_immagine(scena, piattaforma, immagine) {
    let dati = leggi_dati_immagine(immagine);
    let asset = scena.immagini_piattaforme ? scena.immagini_piattaforme[dati.percorso] : null;
    if (!asset) {
        return null;
    }

    let oggetto = PP.assets.image.add(scena, asset, piattaforma.x, piattaforma.y, 0.5, 0.5);
    let risultato = { oggetto: oggetto, offset_x: dati.offset_x, offset_y: dati.offset_y };

    posiziona_immagine(piattaforma, risultato);
    return risultato;
}

function posiziona_immagine(piattaforma, immagine) {
    immagine.oggetto.geometry.x = piattaforma.x + immagine.offset_x;
    immagine.oggetto.geometry.y = piattaforma.y + immagine.offset_y;
}

// GENERAZIONE HITBOX OBLIQUE

function crea_hitbox_obliqua(scena, oggetto, lunghezza, step, angolo_gradi, spessore, fisica = PP.physics.type.STATIC) {
    let x = oggetto.geometry.x;
    let y = oggetto.geometry.y;
    let tangente = Math.tan(angolo_gradi * Math.PI / 180);
    /* 
    la tangente mi serve perche so la base tipo 100, so l'angolo tipo 20 gradi ma non so l'altezza, 
    so perù che la tangente è il rapporto altezza (sen) / base (cos) quindi a logica calcolo la 
    tangente, la moltiplico per la base e ottengo l'offeset verticale, easy as that 
    */
    let larghezza_hitbox = lunghezza / step;

    oggetto.hitbox = [];

    for (let i = 0; i < step; i++) {
        let centro_x = x - lunghezza / 2 + (i + 0.5) * larghezza_hitbox;
        let centro_y = y - (centro_x - x) * tangente;

        let hitbox = PP.shapes.rectangle_add(scena, centro_x, centro_y, larghezza_hitbox, spessore, COLORE_HITBOX, ALPHA_HITBOX);
        PP.physics.add(scena, hitbox, fisica);
        oggetto.hitbox.push(hitbox);
    }
}

function collisioni_hitbox_obliqua(scena, giocatore, oggetto) {
    for (let i = 0; i < oggetto.hitbox.length; i++) {
        if (oggetto.mobile) {
            PP.physics.add_collider_f(scena, giocatore, oggetto.hitbox[i], function () {
                ritorna_se_colpisce(giocatore, oggetto);
            });
        } else {
            PP.physics.add_collider(scena, giocatore, oggetto.hitbox[i]);
        }
    }
}

// FUNZIONI GENERAZIONE AGGIUNTE & TRIGGERS

function crea_zona_attrito(scena, piattaforma, attrito) {
    let bordo_sinistro = piattaforma.x - piattaforma.lunghezza / 2;
    let sinistra = bordo_sinistro + attrito.da * piattaforma.lunghezza;
    let destra = bordo_sinistro + attrito.a * piattaforma.lunghezza;

    let centro_x = (sinistra + destra) / 2;
    let centro_y = piattaforma.y - ALTEZZA_ZONA_ATTRITO / 2;

    let zona = PP.shapes.rectangle_add(scena, centro_x, centro_y, destra - sinistra, ALTEZZA_ZONA_ATTRITO, COLORE_ATTRITO, ALPHA_ATTRITO);
    PP.physics.add(scena, zona, PP.physics.type.STATIC);

    zona.attrito = attrito;
    return zona;
}

function segna_zona_attrito(scena, giocatore, zona) {
    giocatore.zona_attrito = zona.attrito;
}

function lancia_da_molla(scena, giocatore, zona) {
    if (PP.physics.get_velocity_y(giocatore) < 0) return;
    PP.physics.set_velocity_y(giocatore, -zona.forza);
    giocatore.lanciato_da_molla = true;
}

export function attiva_triggers_piattaforme(scena, giocatore, piattaforme) {
    for (let piattaforma of piattaforme) {
        collisioni_hitbox_obliqua(scena, giocatore, piattaforma);
        if (piattaforma.molla) {
            PP.physics.add_overlap_f(scena, giocatore, piattaforma.molla, lancia_da_molla);
        }
        if (piattaforma.zona_attrito) {
            PP.physics.add_overlap_f(scena, giocatore, piattaforma.zona_attrito, segna_zona_attrito);
        }
    }
}

// FUNZIONI MOVIMENTO

function rendi_mobile(oggetto) {
    PP.physics.set_allow_gravity(oggetto, false);
    PP.physics.set_immovable(oggetto, true);
}

function muovi_piattaforma(scena, piattaforma) {
    let movimento = piattaforma.mobile;
    let passo = 1 / 60;

    let dx = movimento.a.x - movimento.da.x;
    let dy = movimento.a.y - movimento.da.y;
    let distanza = Math.sqrt(dx * dx + dy * dy);

    movimento.avanzamento += movimento.direzione * movimento.velocita * passo / distanza;

    if (movimento.avanzamento >= 1) {
        movimento.avanzamento = 1;
        movimento.direzione = -1;
    }
    if (movimento.avanzamento <= 0) {
        movimento.avanzamento = 0;
        movimento.direzione = 1;
    }

    let t = movimento.avanzamento;
    let progresso = t * t * (3 - 2 * t);

    let nuovo_x = movimento.da.x + dx * progresso;
    let nuovo_y = movimento.da.y + dy * progresso;

    let velocita_x = (nuovo_x - piattaforma.x) / passo;
    let velocita_y = (nuovo_y - piattaforma.y) / passo;

    let corpi = piattaforma.hitbox.slice();
    if (piattaforma.molla) corpi.push(piattaforma.molla);

    for (let corpo of corpi) {
        PP.physics.set_velocity_x(corpo, velocita_x);
        PP.physics.set_velocity_y(corpo, velocita_y);
    }

    piattaforma.velocita_y = velocita_y;
    piattaforma.x = nuovo_x;
    piattaforma.y = nuovo_y;

    if (piattaforma.immagine) posiziona_immagine(piattaforma, piattaforma.immagine);
}

function ritorna_se_colpisce(giocatore, piattaforma) {
    let sta_scendendo = piattaforma.velocita_y > 0;
    let giocatore_sotto = giocatore.geometry.y > piattaforma.y + SPESSORE;
    if (!sta_scendendo || !giocatore_sotto) return;

    piattaforma.mobile.direzione = -piattaforma.mobile.direzione;
    piattaforma.velocita_y = 0;
}

export function aggiorna(scena, giocatore, piattaforme) {
    let attrito = giocatore.zona_attrito;
    giocatore.zona_attrito = null;
    giocatore.velocita_max = null;
    giocatore.moltiplicatore_attrito = 1;
    giocatore.moltiplicatore_accelerazione = 1;
    giocatore.salto_bloccato = false;

    for (let piattaforma of piattaforme) {
        if (piattaforma.mobile) muovi_piattaforma(scena, piattaforma);
    }

    if (!attrito || !PP.physics.is_on_ground(giocatore)) return;

    let superficie_scivolosa = attrito.tipo === "scivoloso";

    giocatore.moltiplicatore_attrito = superficie_scivolosa ? SCIVOLOSO_ATTRITO : APPICCICOSO_ATTRITO;
    giocatore.moltiplicatore_accelerazione = superficie_scivolosa ? SCIVOLOSO_ACCELERAZIONE : APPICCICOSO_ACCELERAZIONE;
    giocatore.salto_bloccato = !superficie_scivolosa;
    giocatore.velocita_max = attrito.tipo=="appiccicoso"? 120 : null;
    console.log("calcolato: "+attrito.tipo);console.log( superficie_scivolosa? null : 120)
}

