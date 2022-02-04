/**
 * Escena para la precarga de los assets que se usarán en el juego.
 */
 export default class Boot extends Phaser.Scene {
  /**
   * Constructor de la escena
   */
  constructor() {
    super({
      key: 'boot'
    });
  }

  loadFont(name, url) {
    let newFont = new FontFace(name, `url(${url})`);
    newFont.load().then(function (loaded) {
      document.fonts.add(loaded);
    }).catch(function (error) {
      return error;
    });
  }

  /**
   * Carga de los assets del juego
   */
  preload() {
    let width = this.cameras.main.width;
    let height = this.cameras.main.height;

    //Barra de progreso
    this.createProgressBar(width, height);

    // Con setPath podemos establecer el prefijo que se añadirá a todos los load que aparecen a continuación
    this.load.setPath('assets/sprites/');

    //Cargamos todos los sprites
    let sprites = ["sofa_cat", "sofa", "hall", "lamp", "lamp_floor", "napkin", "player", "remote", "button",
      "snack", "sofa_cat_warning", "sofa_cat_lose", "coat", "coat_floor", "cup", "cup_spilled", "food", "bowl", "bowl_full"];
    sprites.forEach(element => {
      this.load.image(element, `${element}.png`);
    });

    //Cargamos animaciones
    this.load.setPath('assets/animations/');
    let animations = [];
    animations.forEach(element => {
      this.load.spritesheet(element.name, `${element.name}.png`, {
        frameWidth: element.w,
        frameHeight: element.h,
        margin: 1
      });
    });

    //Cargamos la música
    this.load.setPath('assets/music/');
    let songs = [];
    songs.forEach(element => {
      this.load.audio(element, `${element}.mp3`);
    });

    //Cargamos los sonidos
    this.load.setPath('assets/sounds/');
    let wavSounds = [ ];
    wavSounds.forEach(element => {
      this.load.audio(element, `${element}.wav`);
    });
    let mp3Sounds = ["anime", "bowl", "coat", "footstep", "hiss", "lamp", "remote", "shake", "swipe", "growl"];
    mp3Sounds.forEach(element => {
      this.load.audio(element, `${element}.mp3`);
    });
  }

  /**
   * Creación de la escena. En este caso, solo cambiamos a la escena que representa la pantalla de título
   */
  create() {
    this.scene.start('sofa');
  }

  /**
   * Barra de progreso sacada del tutorial.
   * Captura los eventos del load para actualizarse y mostrar información sobre el progreso.
   * @param {integer} width Anchura de la pantalla
   * @param {integer} height Altura de la pantalla
   */
  createProgressBar(width, height) {
    let progressBar = this.add.graphics();
    let progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);

    //Texto del loading
    let loadingText = this.addInterfaceText(width / 2, height / 2 - 30, 'Loading...', 24, '#ffffff');

    //Porcentaje
    let percentText = this.addInterfaceText(width / 2, height / 2 + 25, '0%', 18, '#ffffff');

    //Información sobre el asset cargado
    let assetText = this.addInterfaceText(width / 2, height / 2 + 80, '', 18, '#ffffff');

    //Nos suscribimos a eventos sobre la carga de archivos
    this.load.on('progress', function (value) {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
      percentText.setText(parseInt(value * 100) + '%');
    });

    this.load.on('fileprogress', function (file) {
      assetText.setText('Loading asset: ' + file.key);
    });

    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });
  }

  /**
   * Crea un texto en la interfaz de usuario
   * @param {integer} x Posición en el eje X (esquina superior derecha)
   * @param {integer} y Posición en el eje Y (esquina superior derecha)
   * @param {string} s Texto a escribir en el elemento de la interfaz
   * @param {integer} size Tamaño del texto en px
   * @param {string} color Color del texto. Se trata de un string con el código RGB del mismo ('#XXXXXX')
   * @returns 
   */
  addInterfaceText(x, y, s, size, color) {
    let text = this.add.text(x, y, s, {
      fontFamily: 'Prompt',
      fontSize: size,
      color: color,
      align: 'center'
    });
    text.setOrigin(.5);

    return text;
  }
}