export default class SofaCat extends Phaser.GameObjects.Sprite {
    constructor(scene){
        super(scene, 500, 400, 'sofa_cat');
        this.scene.add.existing(this);
        this.warningSpeed = 2;
        this.loseSpeed = 5;
        this.scene = scene;

        this.setInteractive();
        scene.input.setDraggable(this);
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        scene.input.on('dragend', function (pointer, gameObject) {
            if(gameObject.x > 950 && gameObject.x < 1100 && gameObject.y > 350 && gameObject.y < 400){
                console.log("Ganas");
                scene.scene.start("hall");
            }
            else{
                this.lose();
            }
        });
    }

    preUpdate(t, dt){
        //Mide la distancia que hemos movido al gato
        let velocity = Math.sqrt(Math.pow(this.x - this.lastX, 2) + Math.pow(this.y - this.lastY, 2));
        if(velocity > this.warningSpeed){
            this.setTexture("sofa_cat_warning");

            if(velocity > this.loseSpeed){
                this.lose();
            }
        }

        this.lastX = this.x;
        this.lastY = this.y;
    }

    lose(){
        this.setTexture("sofa_cat_lose");
        this.scene.scene.start("end");
    }
}