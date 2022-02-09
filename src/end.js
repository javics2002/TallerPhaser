export default class End extends Phaser.Scene {
    constructor() {
      super({ key: 'end' });
    }

    create() {
      let width = this.cameras.main.width;
      let height = this.cameras.main.height;
  
      //Mensaje de felicitación
      this.write(width * .4, height * .3, "¡Has ganado!");
  
      //Botón de volver a la pantalla de título
      let playButton = this.write(width * .3 , height * .6, 'Volver a la pantalla de título').setInteractive();
      playButton.on('pointerdown', () => {
        this.scene.start('title');
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
      textElement.setFontSize(30);
      textElement.setShadow(2, 2, "#333333", 2, false, true);
      return textElement;
    }
}