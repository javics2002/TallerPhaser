import Interactuable from "./interactuable.js";

export default class Cup extends Interactuable {
    constructor(scene) {
        super(scene, 550, 450, "cup_spilled");
    }

    interact() {
        console.log("cup");
        if (this.scene.player.takenObject.texture.key === "napkin") {
            this.setTexture("cup");
            this.setPosition(550, 380);
            this.scene.player.useObject();
            this.scene.taskCompleted();
            this.scene.cat.awake(10);
            this.scene.swipe.play();

            return true;
        } else return false;
    }
}