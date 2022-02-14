export default class End extends Phaser.Scene {
    constructor() {
      super({ key: 'end' });
    }

    create() {
      let width = this.cameras.main.width;
      let height = this.cameras.main.height;
  
      //Mensaje de felicitación
      //Podemos usar this.add.text, igual que hicimos en la escena title
  
      //Botón de volver a la pantalla de título
      //Al pulsar en el cargamos la escena "title" igual que hicimos en la escena title
    }
}