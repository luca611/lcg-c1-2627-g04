const ANNERIMENTO_BORDO = "./resources/Hud/BordoAnnerito.png";

let img_annerimento_bordo;
let layer_hud;
let elementi_hud = [];

export function inizializza_HUD(scene) {
    img_annerimento_bordo = PP.assets.image.load(scene, ANNERIMENTO_BORDO);
}

export function crea_layer_HUD(scene) {
    elementi_hud = [];
    layer_hud = PP.layers.create(scene);
    PP.layers.set_z_index(layer_hud, 100);
}

function aggiungi_a_HUD(elemento) {
    console.log(layer_hud)
    PP.layers.add_to_layer(layer_hud, elemento);
    elementi_hud.push(elemento);
}

export function visualizza_HUD(scene) {
    crea_layer_HUD(scene);
    console.log(layer_hud)
    //let bordo = PP.assets.image.add(scene, img_annerimento_bordo, 0, 0, 0, 0);
    //bordo.ph_obj.setScrollFactor(0)
    //aaggiungi_a_HUD(bordo);
}

export function aggiorna_HUD(scene) {
    let camera_x = PP.camera.get_scroll_x(scene);
    let camera_y = PP.camera.get_scroll_y(scene);

}