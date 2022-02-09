export default class Box extends Phaser.Physics.Matter.Sprite {
    /** 
     * @param {Phaser.Scene} scene Escena en la que aparece la caja
     * @param {Number} x Coordenada X
     * @param {Number} y Coordenada Y
     */
    constructor(scene, x, y){
        super(scene.matter.world, x, y,'box');
        this.scene.add.existing(this);
    }
}