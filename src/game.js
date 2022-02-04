import Boot from './boot.js';
import Title from './title.js';
import Select from './level_select.js';
import Tower1 from './tower1.js';
import Tower2 from './tower2.js';
import Tower3 from './tower3.js';
import Tower4 from './tower4.js';
import Tower5 from './tower5.js';

function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;

    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}

const initGame = () => {
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
        pixelArt: false,
        scene: [Boot, Title, Select, Tower1, Tower2, Tower3, Tower4, Tower5],
        physics: {
            default: 'matter',
            matter: {
                gravity: {
                    y: 2
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
}