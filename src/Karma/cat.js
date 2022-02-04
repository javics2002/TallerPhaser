export default class Cat extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 170, 300, 'sofa_cat');
        this.setScale(0.4);
        scene.add.existing(this);
        this.scene = scene;
        this.awareness = 0;
        this.limit = 100;

        this.timer = this.scene.time.addEvent({
            delay: 5000,
            callback: this.growl,
            callbackScope: this,
            loop: true
        });
    }

    preUpdate(t, dt) {
        if (this.isAwake()) {
            this.setTexture("sofa_cat_lose");
            this.scene.hiss.play();
            this.scene.anime.stop();
            this.scene.scene.start("end");
        } else if (this.awareness > this.limit * 0.6) {
            this.setTexture("sofa_cat_warning");
        } else {
            this.setTexture("sofa_cat");
        }

        console.log(this.awareness);
        this.timer.paused = this.awareness < this.limit * 0.6;
    }

    awake(intensity) {
        this.awareness += intensity;
    }

    sleep() {
        if (this.awareness > 0)
            this.awareness--;
    }

    isAwake() {
        return this.awareness > this.limit;
    }

    growl() {
        this.scene.growl.play();
    }
}