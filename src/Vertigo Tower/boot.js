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
    //Fuentes del juego
    this.loadFont("Vertigon", "assets/fonts/Vertigon.otf");

    let width = this.cameras.main.width;
    let height = this.cameras.main.height;

    //Barra de progreso
    this.createProgressBar(width, height);

    //Cargamos las torres
    this.load.setPath('assets/map/');
    this.load.image('tiles', 'atlas.png');
    for (let i = 1; i <= 5; i++) {
      //Tiles desde JSON
      this.load.tilemapTiledJSON(`torre${i}`, `torre_${i}.json`);
      //Preview de las torres
      this.load.image(`tower${i}preview`, `torre_${i}.png`);
    }

    // Con setPath podemos establecer el prefijo que se añadirá a todos los load que aparecen a continuación
    this.load.setPath('assets/sprites/');

    //Cargamos todos los sprites
    let sprites = ['rope', 'rope_pivot', 'box', 'exit_icon', 'shadow', 'up_arrow', 'down_arrow',
      'mute_off', 'mute_on', 'enter_fullscreen', 'exit_fullscreen', 'share', 'title', 'fragment', 'level_select_bg'
    ];
    sprites.forEach(element => {
      this.load.image(element, `${element}.png`);
    });

    //Cargamos animaciones
    this.load.setPath('assets/animations/');
    let animations = [{
      name: 'scottie_idle',
      w: 37,
      h: 62
    }, {
      name: 'scottie_run',
      w: 56,
      h: 55
    }, {
      name: 'scottie_idle_jump',
      w: 36,
      h: 58
    }, {
      name: 'scottie_run_jump',
      w: 45,
      h: 54
    }, {
      name: 'scottie_climb',
      w: 38,
      h: 61
    }, {
      name: 'scottie_push',
      w: 40,
      h: 59
    }, {
      name: 'scottie_jump',
      w: 34,
      h: 56
    }, {
      name: 'scottie_hang',
      w: 34,
      h: 56
    }, {
      name: 'shadow_rise',
      w: 38,
      h: 61
    }, {
      name: 'judy_idle',
      w: 47,
      h: 58
    }, {
      name: 'judy_fall',
      w: 42,
      h: 54
    }, {
      name: 'judy_hole',
      w: 50,
      h: 23
    }, {
      name: 'judy_win',
      w: 58,
      h: 62
    }, {
      name: 'scottie_win',
      w: 50,
      h: 62
    }, {
      name: 'scottie_wall_slide',
      w: 37,
      h: 61
    }];
    animations.forEach(element => {
      this.load.spritesheet(element.name, `${element.name}.png`, {
        frameWidth: element.w,
        frameHeight: element.h,
        margin: 1
      });
    });

    //Cargamos la música
    this.load.setPath('assets/music/');
    let songs = ['vertigo', 'tower', 'win'];
    songs.forEach(element => {
      this.load.audio(element, `${element}.mp3`);
    });

    //Cargamos los sonidos
    this.load.setPath('assets/sounds/');
    let wavSounds = ['fix_stairs', 'jump', 'pick_up', ];
    wavSounds.forEach(element => {
      this.load.audio(element, `${element}.wav`);
    });
    let mp3Sounds = ['fall', 'help_me', 'ladder1', 'ladder2', 'push_box', 'scream', 'thump', ];
    mp3Sounds.forEach(element => {
      this.load.audio(element, `${element}.mp3`);
    });
  }

  /**
   * Creación de la escena. En este caso, solo cambiamos a la escena que representa la pantalla de título
   */
  create() {
    this.scene.start('title');
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
      fontFamily: 'Caveat',
      fontSize: size,
      color: color,
      align: 'center'
    });
    text.setOrigin(.5);

    return text;
  }
}