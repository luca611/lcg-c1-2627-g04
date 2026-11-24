const PARALLASSE_SFONDO = 0.95;
const PARALLASSE_PRIMO_PIANO = 1.50;

let sfondo = null;
let primo_piano = null;

let altezza = 0
let larghezza = 0;

function crea_immagine(scene, immagine, y, z_index) {
    const oggetto = PP.assets.tilesprite.add(scene, immagine, 0, y, larghezza, altezza, 0, 0);
    const layer = PP.layers.create(scene);
    PP.layers.add_to_layer(layer, oggetto);
    PP.layers.set_z_index(layer, z_index);
    return oggetto;
}

export function imposta_dimensioni(larghezza_stanza, altezza_stanza){
    altezza = altezza_stanza;
    larghezza = larghezza_stanza;
}

function posiziona(scene, tile, valore_parallasse) {
    const scroll_camera = PP.camera.get_scroll_x(scene);
    tile.tile_geometry.x = scroll_camera * valore_parallasse;
}

export function crea_sfondo(scene, immagine, y, z_index) {
    sfondo = crea_immagine(scene, immagine, y, z_index);
    sfondo.tile_geometry.scroll_factor_x = PARALLASSE_SFONDO;
    //posiziona(scene, sfondo, PARALLASSE_SFONDO);
    return sfondo;
}

export function crea_primo_piano(scene, immagine, y, z_index) {
    primo_piano = crea_immagine(scene, immagine, y, z_index);
    primo_piano.tile_geometry.scroll_factor_x = PARALLASSE_PRIMO_PIANO;
    //posiziona(scene, primo_piano, PARALLASSE_PRIMO_PIANO);
    return primo_piano;
}

export function aggiorna_parallasse(scene) {
    if (sfondo) {
        //posiziona(scene, sfondo, PARALLASSE_SFONDO);
    }
    if (primo_piano) {
        //posiziona(scene, primo_piano, PARALLASSE_PRIMO_PIANO);
    }
}