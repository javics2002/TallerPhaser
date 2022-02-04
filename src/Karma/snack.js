import Interactuable from "./interactuable.js";

export default class Snack extends Interactuable {
    constructor(scene) {
        super(scene, 1200, 300, "snack");
    }

    interact() {
        console.log("snack");
        if (!this.scene.player.takenObject.visible) {
            this.scene.player.takeObject("snack");
            this.setVisible(false);
            this.setActive(false);
            this.scene.snack.play();

            return true;
        } else return false;
    }
}