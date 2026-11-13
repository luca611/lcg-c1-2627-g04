const LARGHEZZA_BORDO = 50;
const COLORE_BORDO = "0x000000";
const ALPHA_BORDO = 0;

export function crea_bordo_sinistro(scene, x, altezza_mondo) {
    const bordo = PP.shapes.rectangle_add(scene, x - LARGHEZZA_BORDO / 2, altezza_mondo / 2, LARGHEZZA_BORDO, altezza_mondo, COLORE_BORDO, ALPHA_BORDO);
    PP.physics.add(scene, bordo, PP.physics.type.STATIC);
    return bordo;
}

export function crea_bordo_destro(scene, x, altezza_mondo) {
    const bordo = PP.shapes.rectangle_add(scene, x + LARGHEZZA_BORDO / 2, altezza_mondo / 2, LARGHEZZA_BORDO, altezza_mondo, COLORE_BORDO, ALPHA_BORDO);
    PP.physics.add(scene, bordo, PP.physics.type.STATIC);
    return bordo;
}

export function crea(scene, x_sinistro, x_destro, altezza_mondo) {
    const sinistro = crea_bordo_sinistro(scene, x_sinistro, altezza_mondo);
    const destro = crea_bordo_destro(scene, x_destro, altezza_mondo);
    return [sinistro, destro];
}
