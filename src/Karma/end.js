export default class End extends Phaser.Scene {
    constructor(){
        super({key: "end"});
    }
    create(){
        this.add.text(400, 330, "YOU DISTURBED KARMA", {
            fontSize: 40,
            fontFamily: 'Prompt'
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