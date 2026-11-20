const PARALLASSE_SFONDO = 0.95;
const PARALLASSE_PRIMO_PIANO = 1.25;

let sfondo = null;
let primo_piano = null;

function crea_immagine(scene, immagine, y, z_index) {
    const oggetto = PP.assets.image.add(scene, immagine, 0, y, 0, 0);
    const layer = PP.layers.create(scene);
    PP.layers.add_to_layer(layer, oggetto);
    PP.layers.set_z_index(layer, z_index);
    return oggetto;
}

function posiziona(scene, layer, valore_parallasse) {
    const scroll_camera = PP.camera.get_scroll_x(scene);
    layer.geometry.x = (1 - valore_parallasse) * scroll_camera;
}

export function crea_sfondo(scene, immagine, y, z_index, larghezza_mondo) {
    sfondo = crea_immagine(scene, immagine, y, z_index, larghezza_mondo);
    posiziona(scene, sfondo, PARALLASSE_SFONDO);
    return sfondo;
}

export function crea_primo_piano(scene, immagine, y, z_index, larghezza_mondo) {
    primo_piano = crea_immagine(scene, immagine, y, z_index, larghezza_mondo);
    posiziona(scene, primo_piano, PARALLASSE_PRIMO_PIANO);
    return primo_piano;
}

export function aggiorna_parallasse(scene) {
    if (sfondo) {
        posiziona(scene, sfondo, PARALLASSE_SFONDO);
    }
    if (primo_piano) {
        posiziona(scene, primo_piano, PARALLASSE_PRIMO_PIANO);
    }
}
