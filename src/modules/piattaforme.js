/* PER CLAUDE:
    in questo file vorrei avere una funzione che crei una piattaforma dati:
    -> coordinate 
    -> angolo se inclinata
    -> l'attrito se non è quello base e quanto (se scivoloso oppure appiccicoso) (l'intervallo dove è scivolosa o appicicosa)
    -> se ha un punto di salto (e le coordinate sull'oggetto dove si trova il punto di salto) e  quanto lancia in alto il salto 
    -> se è mobile e in che direzione si muove e quanto velocemente e le coordinate dei punti di partenza e arrivo del movimento

    dopodichè analizza l'immagine Corridoio.png e crea le piattaforme che vedi in quella immagine, con le coordinate e le caratteristiche che vedi nell'immagine.
    (lo specchio è scivoloso per metà e tutte le molle sono punti di salto, il tubetto di colla è appicicoso e non permette il salto)
*/

const COLORE_HITBOX = "0x000000";
const ALPHA_HITBOX = 0;

export function crea_hitbox_obliqua(scena, oggetto, lunghezza, step, angolo_gradi, spessore) {
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
        PP.physics.add(scena, hitbox, PP.physics.type.STATIC);
        oggetto.hitbox.push(hitbox);
    }
}

export function collisioni_hitbox_obliqua(scena, giocatore, oggetto) {
    for (let i = 0; i < oggetto.hitbox.length; i++) {
        PP.physics.add_collider(scena, giocatore, oggetto.hitbox[i]);
    }
}

export function elimina_hitbox_obliqua(oggetto) {
    for (let i = 0; i < oggetto.hitbox.length; i++) {
        PP.assets.destroy(oggetto.hitbox[i]);
    }
    oggetto.hitbox = [];
}
