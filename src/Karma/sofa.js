import SofaCat from "./sofa_cat.js";
export default class Sofa extends Phaser.Scene {
    constructor(){
        super({key: "sofa"});
    }
    
    create(){
        this.add.image(0, 0, "sofa").setOrigin(0, 0);
        this.add.text(100, 50, "DO NOT DISTURB", {
            fontSize: 30,
            fontFamily: 'Prompt',
            color: "#bb44ff"
        });
        this.add.text(100, 80, "KARMA", {
            fontSize: 70,
            fontFamily: 'Prompt',
            color: "#bb44ff"
        });
        new SofaCat(this);
    }
}