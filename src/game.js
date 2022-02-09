import Boot from './boot.js';
import Title from './title.js';
import Castle from './castle.js';
import End from './end.js';

//Configuración del juego
let config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    fps: 60,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    pixelArt: true,
    scene: [Boot, Title, Castle, End],
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                y: .5
            },
            debug: false,
            runner: {
                isFixed: true,
                fps: 60
            }
        }
    }
};

let game = new Phaser.Game(config);

game.audioConfig = {
    mute: false,
    volume: 1,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 0,
};