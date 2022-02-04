export default class Win extends Phaser.Scene {
    constructor(){
        super({key: "win"});
    }
    create(){
        this.add.text(400, 300, "YOU TIDIED THE ROOM", {
            fontSize: 40,
            fontFamily: 'Prompt'
        });
        this.add.text(300, 350, "BUT MORE IMPORTANTLY, KARMA IS SLEEPING", {
            fontSize: 30,
            fontFamily: 'Prompt',
            color: "#ff4499"
        });
        let button = this.add.text(600, 400, "REPEAT", {
            fontSize: 20,
            fontFamily: 'Prompt',
            color: "#ffee44"
        }).setInteractive();

        button.on('pointerdown', () => {
            this.scene.start('sofa');
        });
    }
}