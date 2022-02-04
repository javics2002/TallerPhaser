import Interactuable from "./interactuable.js";

export default class Bowl extends Interactuable {
    constructor(scene){
        super(scene, 150, 650, "bowl");
    }

    interact(){
        console.log("bowl");
        if(this.scene.player.takenObject.texture.key === "snack"){
            this.setTexture("bowl_full");
            this.scene.player.useObject();
            this.scene.taskCompleted();
            this.scene.cat.awake(30);
            this.scene.bowl.play();

            return true;
        }
        else return false;
    }
}