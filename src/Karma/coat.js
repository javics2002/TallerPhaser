import Interactuable from "./interactuable.js";

export default class Coat extends Interactuable {
    constructor(scene){
        super(scene, 850, 600, "coat_floor");
    }

    interact(){
        console.log("coat_floor");
        this.setPosition(900, 480);
        this.setTexture("coat");
        this.scene.taskCompleted();
        this.scene.cat.awake(10);
        this.scene.coat.play();
        return true;
    }
}