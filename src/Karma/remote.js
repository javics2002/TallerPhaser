import Interactuable from "./interactuable.js";

export default class Remote extends Interactuable {
    constructor(scene){
        super(scene, 50, 100, "remote");

        this.timer = this.scene.time.addEvent({
            delay: 1000,
            callback: this.tv,
            callbackScope: this,
            loop: true
        });
    }

    interact(){
        console.log("remote");
        this.setPosition(200, 200);
        this.scene.cat.awake(20);
        this.scene.taskCompleted();
        this.scene.anime.stop();
        this.scene.remote.play();
        this.timer.paused = true;

        return true;
    }

    tv(){
        this.scene.cat.awake(3);
    }
}