export default class Player extends Phaser.GameObjects.Container {
    constructor(scene) {
        let player = scene.add.sprite(30, 20, "player");
        super(scene, 400, 200, player);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.body.setCollideWorldBounds();
        this.cursorsWASD = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
        this.speed = 100;
        this.diagonalSpeed = 70;
        this.takenObject = scene.add.sprite(30, -20, "remote");
        this.takenObject.setVisible(false);
        this.add(this.takenObject);
        
        this.timer = this.scene.time.addEvent({
            delay: 800,
            callback: this.step,
            callbackScope: this,
            loop: true
        });
    }

    preUpdate(t, dt) {
        let left = this.cursorsWASD.left.isDown,
            right = this.cursorsWASD.right.isDown,
            up = this.cursorsWASD.up.isDown,
            down = this.cursorsWASD.down.isDown;
        let diagonal = (left || right) && (up || down);
        if (left) {
            this.body.setVelocityX(diagonal ? -this.diagonalSpeed : -this.speed);
        } else if (right) {
            this.body.setVelocityX(diagonal ? this.diagonalSpeed : this.speed);
        } else
            this.body.setVelocityX(0);
        if (up) {
            this.body.setVelocityY(diagonal ? -this.diagonalSpeed : -this.speed);
        } else if (down) {
            this.body.setVelocityY(diagonal ? this.diagonalSpeed : this.speed);
        } else
            this.body.setVelocityY(0);
        if (!left && !right && !up && !down) {
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
        }
        
        this.timer.paused = !left && !right && !up && !down;
    }

    takeObject(texture) {
        this.takenObject.setVisible(true);
        this.takenObject.setTexture(texture);
    }

    useObject(){
        this.takenObject.setVisible(false);
    }

    step(){
        this.scene.cat.awake(7);
        console.log("step");
        this.scene.footstep.play();
    }
}