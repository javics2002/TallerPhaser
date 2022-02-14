export default class Title extends Phaser.Scene {
  constructor() {
    super({
      key: 'title'
    });
  }

  create() {
    let width = this.cameras.main.width;
    let height = this.cameras.main.height;

    //Añadimos una imagen de fondo
    //Hay que decirle en qué posición, y qué imagen, usando this.add
    //this.add.image(x, y, "nombre de la imagen")
    //Podemos probar ahora poniendo la imagen "title" en la posicion (0, 0)
    //Para centrarla, tenemos que decirle despues .setOrigin(0, 0)

    //Añadimos el titulo de nuestro juego
    //Podemos usar this.add.text(x, y, "titulo de tu maravilloso primer juego")

    //Añadimos el botón de PLAY
    //Lo hacemos igual que el texto, pero tenemos que decirle que sea interactivo con .setInteractive()
    //Así se convierte en botón, y nosotros le decimos lo que tiene que hacer cuando lo pulsemos:
    let playButton = 
    //Aqui le decimos que cargue la escena castle cuando pulsemos en playButton
    playButton.on('pointerdown', () => {
      this.scene.start('castle');
    });

    //Botón de pantalla completa
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