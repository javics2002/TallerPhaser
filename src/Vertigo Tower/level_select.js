function enterFullScreen() {
    var canvas = document.querySelector("canvas");
     canvas.style.border = "0vh solid #505050";
     canvas.style.transform = "translateY(0%)";
}
function exitFullScreen() {
    var canvas = document.querySelector("canvas");
    canvas.style.border ="3vh solid #505050";
    canvas.style.transform = "translateY(15%)";
}

export default class Select extends Phaser.Scene {
    /**
     * Constructor de la escena
     */
    constructor() {
        super({
            key: 'select'
        });
    }

    preload() {
        //Música del menú
        this.vertigo = this.sound.add('vertigo', this.game.audioConfig);
    }

    create() {
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;

        this.add.image(0,0, 'level_select_bg').setOrigin(0, 0);

        //Creamos una columna para cada nivel
        this.createTowerColumns()

        //Boton para volver a la pantalla de título
        this.addInteractiveText(90, height - 50, 'Back to title ', function () {
            this.scene.vertigo.stop();
            this.scene.scene.start('title');
        });

        //Mute
        let mute = this.game.audioConfig.mute ? 'mute_on' : 'mute_off';
        this.addInteractiveImage(width - 150, height - 50, mute, function () {
            this.scene.game.audioConfig.mute = !this.scene.game.audioConfig.mute;
            this.scene.vertigo.setMute(!this.scene.vertigo.mute);
            this.setTexture(this.scene.game.audioConfig.mute ? 'mute_on' : 'mute_off');
        });

        //Fullscreen
        let fullscreenButtonTexture = this.scale.isFullscreen ? 'exit_fullscreen' : 'enter_fullscreen';
        this.addInteractiveImage(width - 90, height - 50, fullscreenButtonTexture, function () {
            if (this.scene.scale.isFullscreen) {
                this.setTexture('enter_fullscreen');
                this.scene.scale.stopFullscreen();
                exitFullScreen();
            } else {
                this.setTexture('exit_fullscreen');
                this.scene.scale.startFullscreen();
                enterFullScreen();
              
            }
        });

        //Música
        this.vertigo.play();
    }

    /**
     * Crea las 5 columnas de las torres en el menú de selección de niveles.
     * Cada columna tiene su nombre, una preview de la torre, el mejor tiempo y el botón de PLAY
     */
    createTowerColumns() {
        let towerNames = [];
        let towerPreviews = [];
        let recordText = [];
        let playButtons = [];
        let shareButtons = [];
        let towerLocked = false;
        let self = this;
        for (let i = 0; i < 5; i++) {
            //Fondo
            drawBackgroundRectangle(i);

            //Nombre de la torre
            writeTextInColumns(towerNames, i, 100, ` Tower ${i + 1} `, 50, '#e07a66', "#333333");

            //Preview de la torre
            drawImageInColumns(towerPreviews, i, 0, 450, `tower${i + 1}preview`,{x: .5, y: 1}, .05);
            if (towerLocked)
                towerPreviews[i].setTint(0X000000);

            //Botón de PLAY
            let playColor = towerLocked ? '#505050' : '#ffffff';
            let shadowColor = towerLocked ? '#000000' : "#f3463a";
            writeTextInColumns(playButtons, i, 530, " PLAY ", 40, playColor, shadowColor);
            if (!towerLocked) {
                playButtons[i].setInteractive();
                playButtons[i].on('pointerdown', enterTower);
            }

            //Récord
            writeTextInColumns(recordText, i, 470, `Record: ${this.game.levelsInfo[i + 1].record} s`, 18, '#D6D45A');
            if (recordText[i].text === "Record: 0 s") {
                //No hay datos del récord
                recordText[i].setColor('#838383');
                recordText[i].text = "No data";

                //Es el último nivel accesible (si el modo debug está activo no bloquea ningún nivel)
                towerLocked = !this.game.config.physics.matter.debug;
            } else {
                //Botón de compartir
                drawImageInColumns(shareButtons, i, 60,470, 'share',{x: 0, y: .5}, .8);
                shareButtons[i].setInteractive(new Phaser.Geom.Rectangle(16, -16, 32, 32), Phaser.Geom.Rectangle.Contains);
                shareButtons[i].on('pointerup', clickShareScore, this);
            }

            /**
             * Para la música del menú y carga la torre
             */
            function enterTower() {
                this.scene.vertigo.stop();
                this.scene.scene.start(`Tower ${i + 1}`);
            }

            /**
             * Abre una nueva pestaña para compartir el record obtenido en esa torre en Twitter
             */
            function clickShareScore() {
                let text = `¡He rescatado a Judy en la torre ${i + 1} en solo ${this.game.levelsInfo[i + 1].record}s! ¿Podrás superarme en @vertigo_tower ? https://t.co/mv5sKRrnXh`;
                let url = `http://twitter.com/intent/tweet?text=${text}`;

                window.open(url, '_blank');
            }
        }

        /**
         * Dibuja una imagen en las columnas
         * @param {Array} columns Array que almacena cada imagen
         * @param {integer} i Número de la torre que representa
         * @param {integer} offset Desplazamiento adicional de la imagen respecto al centro de la columna
         * @param {integer} heigth Altura a la que se coloca
         * @param {string} texture Nombre de la textura del botón. Debe ser la misma con la que se cargó.
         * @param {Object} origin Origen de la textura. Es un objeto con numbers x e y, entre 0 y 1.
         * @param {number} scale Escala de la imagen
         */
        function drawImageInColumns(columns, i, offset, heigth, texture, origin, scale) {
            columns[i] = self.add.image(190 + i * 224 + offset, heigth, texture);
            columns[i].setOrigin(origin.x, origin.y);
            columns[i].setScale(scale);
        }

        /**
         * Escribe texto en las columnas
         * @param {Array} columns Array que almacena cada elemento de texto
         * @param {integer} i Número de la torre que representa
         * @param {integer} heigth Altura a la que se coloca
         * @param {string} text Texto a escribir en la columna
         * @param {integer} fontSize Tamaño del texto
         * @param {string} textColor Color del texto. Se trata de un string con el código hexadecimal RGB del color '#XXXXXX'
         * @param {string} shadowColor Color de la sombra. Se trata de un string con el código hexadecimal RGB del color '#XXXXXX'
         */
        function writeTextInColumns(columns, i, heigth, text, fontSize, textColor, shadowColor) {
            columns[i] = self.add.text(190 + i * 224, heigth, text, {
                fontFamily: 'Caveat',
                fontSize: fontSize,
                color: textColor
            });
            columns[i].setOrigin(0.5, 0.5);
            if (shadowColor)
                columns[i].setShadow(2, 2, shadowColor, 2, false, true);
        }

        /**
         * Dibuja un rectángulo negro que sirve para unir todos los elementos de la misma torre
         * @param {integer} i Número de la torre que representa
         */
        function drawBackgroundRectangle(i) {
            let column = self.add.graphics();
            column.fillStyle(0x222222, 0.9);
            column.fillRect(90 + i * 224, 50, 204, 530);
        }
    }

    /**
     * Crea un botón en la interfaz de usuario
     * @param {integer} x Posición en el eje X (esquina inferior izquierda)
     * @param {integer} y Posición en el eje Y (esquina inferior izquierda)
     * @param {string} text Texto a escribir en el botón
     * @param {function} buttonAction Función que se realiza al pulsar el botón
     */
    addInteractiveText(x, y, text, buttonAction) {
        let button = this.add.text(x, y, text, {
            fontFamily: 'Caveat',
            fontSize: 30,
            color: '#fed882',
            strokeThickness: 20,
            stroke: '#342c25'
        });
        button.setInteractive(new Phaser.Geom.Rectangle(0, -20, 150, 50), Phaser.Geom.Rectangle.Contains);
        button.setOrigin(0, 1);
        //button.setShadow(2, 2, "#333333", 2, false, true);
        button.on('pointerdown', buttonAction);
    }

    /**
     * Crea una imagen en la interfaz de usuario
     * @param {*} x Posición en el eje X (esquina inferior derecha)
     * @param {*} y Posición en el eje Y (esquina inferior derecha)
     * @param {*} textureName Nombre de la textura del botón. Debe ser la misma con la que se cargó.
     * @param {function} buttonAction Función que se realiza al pulsar el botón
     * @returns Devuelve el elemento de la interfaz para poder modificarlo
     */
    addInteractiveImage(x, y, textureName, buttonAction) {
        let size = 32;
        let button = this.add.sprite(x, y, textureName);
        button.setTint(0X342c25);
        button.setInteractive(new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size), Phaser.Geom.Rectangle.Contains);
        button.setOrigin(1, 1);

        button.on('pointerdown', buttonAction);

        return button;
    }
}