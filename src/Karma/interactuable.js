export default class Interactuable extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.texture = texture;
        this.scene = scene;

        this.firstTime = true;
    }

    overlap() {
        if (this.firstTime) {
            //hace aparecer un boton para hacer click
            let button = this.scene.add.image(this.x, this.y - 20, "button").setInteractive();
            button.on('pointerdown', () => {
                if(this.interact())
                    button.destroy();
            });

            this.firstTime = false;
        }
    };

    interact() {
        //Virtual. Cada objeto interactuable reescribe esta función
        console.log("Te has olvidado asignar esta función en " + this.texture);

        return false;
    };
}