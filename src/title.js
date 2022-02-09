export default class Title extends Phaser.Scene {
  constructor() {
    super({
      key: 'title'
    });
  }

  create() {
    let width = this.cameras.main.width;
    let height = this.cameras.main.height;

    //Imagen de fondo
    this.add.image(0, 0, 'title').setOrigin(0, 0);

    //Texto del título
    this.write(width * .15, height * .3, "MY GAME");

    //Botón de PLAY
    let playButton = this.write(width * .15, height * .6, 'PLAY ').setInteractive();
    playButton.on('pointerdown', () => {
      this.scene.start('castle');
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
  }

  /**
   * Escribe en la pantalla el texto dado en la posición (x, y)
   * @param {integer} x Posición en la pantalla en el eje X (punto izquierdo central)
   * @param {integer} y Posición en la pantalla en el eje Y (punto izquierdo central)
   * @param {string} text Texto a escribir
   * @returns 
   */
  write(x, y, text) {
    let textElement = this.add.text(x, y, text);
    textElement.setOrigin(0, 0.5);
    textElement.setFontSize(50);
    textElement.setShadow(2, 2, "#333333", 2, false, true);
    return textElement;
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
    let size = 64;
    let button = this.add.sprite(x, y, textureName);
    button.setInteractive(new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size), Phaser.Geom.Rectangle.Contains);
    button.setOrigin(1, 1);

    button.on('pointerdown', buttonAction);

    return button;
  }
}