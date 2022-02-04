/**
 * Sombra del asesino que subirá a tirar a Judy en cuanto se acabe el tiempo.
 * Su altura marca cuánto tiempo le falta.
 */
export default class Shadow extends Phaser.GameObjects.Sprite {
    /**
     * Constructor de la sombra
     * @param {Phaser.Scene} scene Escena a la que pertenece el jugador
     * @param {number} x Coordenada X
     * @param {number} y Coordenada Y
     * @param {number} time Tiempo que tardará en llegar a lo alto en segundos
     */
    constructor(scene, x, y, time) {
        super(scene, 17, 30, 'shadow');
        scene.add.existing(this);
        this.setPosition(x, y);
        this.time = time;
        this.scene = scene;

        this.play("shadow_rise");
    }

    /**
     * Comienza el ascenso
     */
    start() {
        this.tween = this.scene.tweens.add({
            targets: [this],
            y: (this.scene.floorHeight + this.scene.margin) * this.scene.tileSize,
            duration: this.time * 1000
        });
    }

    /**
     * Detiene el ascenso, por si ganamos o volvemos al menú
     */
    stop() {
        this.tween.pause();
    }
}