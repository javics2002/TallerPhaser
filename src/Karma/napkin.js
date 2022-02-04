import Interactuable from "./interactuable.js";

export default class Napkin extends Interactuable {
    constructor(scene) {
        super(scene, 700, 470, "napkin");
    }

    interact() {
        console.log("napkin");
        if (!this.scene.player.takenObject.visible) {
            this.scene.player.takeObject("napkin");
            this.setVisible(false);
            this.setActive(false);
            this.scene.cat.awake(5);

            return true;
        } else return false;
    }
}