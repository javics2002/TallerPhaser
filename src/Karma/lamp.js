import Interactuable from "./interactuable.js";

export default class Lamp extends Interactuable {
    constructor(scene){
        super(scene, 950, 80, "lamp_floor");
    }

    interact(){
        console.log("lamp");
        this.setTexture("lamp");
        this.setPosition(750, 100);
        this.scene.taskCompleted();
        this.scene.cat.awake(20);
        this.scene.lamp.play();

        return true;
    }
}