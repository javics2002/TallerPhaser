/**
 * Judy. Está en la cima de la torre a punto de caerse. Si no llegamos a ella a tiempo, se caerá.
 */
export default class Judy extends Phaser.GameObjects.Sprite {
    /**
     * Constructor de Judy
     * @param {Phaser.Scene} scene Escena a la que pertenece el jugador
     */
    constructor(scene) {
        super(scene, 17, 30, 'shadow');
        scene.add.existing(this);
        this.scene = scene;
        this.setPosition(1050, 572);
        this.time = 700;
        this.play("judy_idle");
        this.scream = scene.sound.add('scream');
        this.fall_sound = scene.sound.add('fall');
        this.thump = scene.sound.add('thump');
        this.sounds = [this.scream, this.fall_sound, this.thump];
        this.sounds.forEach(element => {
            element.setMute(scene.game.audioConfig.mute);
        });
    }

    /**
     * Tira a Judy de la torre y se estampa en el suelo dejando un agujero.
     * Recarga el nivel tras esto.
     */
    fall() {
        this.setPosition(1150, 572)
        this.scream.play();
        this.fall_sound.play();
        this.play("judy_fall");

        this.tween = this.scene.tweens.add({
            targets: [this],
            y: (this.scene.floorHeight * (this.scene.floors + 1) + 2) * this.scene.tileSize,
            angle: 500 * this.scene.floors,
            duration: this.time * this.scene.floors,
            ease: "Quad.easeIn",
            onComplete: () => {
                this.setAngle(0);
                this.play('judy_hole');
                this.thump.play();
                this.thump.once("complete", () => {
                    this.scene.repeat();
                });
            }
        });
    }

    /**
     * Reproduce la animación de ganar de Judy
     */
    celebrate() {
        this.play("judy_win");
    }
}