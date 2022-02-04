/**
 * Pantalla principal
 */
export default class Title extends Phaser.Scene {
  constructor() {
    super({ key: 'title' });
  }

  create() {
    let width = this.cameras.main.width;
    let height = this.cameras.main.height;

    this.add.image(0, 0, 'title').setOrigin(0, 0);

    //Texto del título
    this.write(width * .1, height * .3, 'VERTIGO\nTOWER', { 
      fontFamily: 'Vertigon', 
      fontSize: 60, 
      color: '#e07a66' 
    });

    //Botón de PLAY
    let playButton = this.write(width * .15 , height * .6, 'PLAY ', {
      fontFamily: 'Caveat',
      fontSize: 50,
      color: '#ffffff'
    }).setInteractive();
    playButton.on('pointerdown', () => {
      this.scene.start('select');
    });
  }

  /**
   * Escribe en la pantalla el texto dado según las opciones en la posición (x, y)
   * @param {integer} x Posición en la pantalla en el eje X (punto izquierdo central)
   * @param {integer} y Posición en la pantalla en el eje Y (punto izquierdo central)
   * @param {string} text Texto a escribir
   * @param {object} fontOptions Objeto que contiene las opciones del texto
   * @returns 
   */
  write(x, y, text, fontOptions) {
    let textElement = this.add.text(x, y, text, fontOptions);
    textElement.setOrigin(0, 0.5);
    textElement.setShadow(2, 2, "#333333", 2, false, true);
    return textElement;
  }
}