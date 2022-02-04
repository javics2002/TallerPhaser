import Boot from './boot.js';
import Sofa from './sofa.js';
import Hall from './hall.js';
import End from './end.js';
import Win from './win.js';

let config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,  
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
    scene: [Boot, Sofa, Hall, End, Win],
    physics: { 
        default: 'arcade', 
        arcade: { 
            debug: false 
        }
    }
};

new Phaser.Game(config);