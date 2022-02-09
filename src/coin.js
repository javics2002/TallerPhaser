export default class Coin extends Phaser.Physics.Matter.Sprite {
    /** 
     * @param {Phaser.Scene} scene Escena en la que aparece la caja
     * @param {Number} x Coordenada X
     * @param {Number} y Coordenada Y
     */
    constructor(scene, x, y){
        super(scene.matter.world, x, y, 'coin');
        this.scene.add.existing(this);
        this.scene = scene;
        this.setStatic(true);
        this.setSensor(true);
        this.setScale(0.25);

        //Animacion
        this.play("coin");
    }

    destruir(){
        //Si no hemos cogido la moneda aun
        if(this.active){
            //La sumamos a las monedas cogidas
            this.scene.cogerMoneda();

            //Reproducimos el sonido
            this.scene.coinSound.play();

            //Desactivamos la moneda
            this.setActive(false);
            this.setVisible(false);
        }
    }
}