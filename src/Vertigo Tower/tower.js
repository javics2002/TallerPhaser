import Player from './player.js';
import Shadow from './shadow.js';
import Box from './box.js'
import Rope from './rope.js';
import Judy from './judy.js';

/**
 * Escena genérica de una torre. Incluye todo lo común.
 */
export default class Tower extends Phaser.Scene {
  /**
   * Constructor de la escena
   * @param {string} key Nombre de la torre
   * @param {number} defeatTime Tiempo límite para completar el nivel
   * @param {integer} floors Número de plantas de la torre, sin contar el campanario
   * @param {integer} floorHeight Número de tiles que mide un piso
   * @param {string} keyTile Nombre del mapa de Tiled
   * @param {Array<Object<integer, integer>>} cameraRanges Conjunto de rangos en los que la cámara se puede mover, dividida por los pisos de la torre
   * @param {integer} panEnd Posición final de la cámara. Usado para el cálculo del panning inicial de la cámara
   */
  constructor(key, defeatTime, floors, floorHeight, keyTile, cameraRanges, panEnd) {
    super({
      key: key
    });
    this.cameraRanges = cameraRanges;
    this.panEnd = panEnd;
    this.keyTile = keyTile;
    this.key = key;
    this.defeatTime = defeatTime;
    this.floors = floors;
    this.floorHeight = floorHeight;
    this.tileSize = 32;
    this.margin = 2;
    this._lastRopeId = -1;
    this._canGrabLastRope = false;
    this._grabLastRopeTime = 100;
    this._reachedTop = false;
    this.isCinematicFinished = false;
    this.isThisFirstTime = true;
    this.panSpeed = 300;
  }

  preload() {
    this.loadMusic();
  }

  create() {
    this.frameTime = 0;
    this.matter.world.autoUpdate = false;

    let width = this.cameras.main.width;
    let height = this.cameras.main.height;

    //Tamaño del mapa
    this.matter.world.setBounds(0, 0, 1280, (this.floors + 1) * this.floorHeight * this.tileSize + 2 * this.margin * this.tileSize);

    this.buildTower();

    //Animaciones
    this.createAnimations();

    //Personajes
    this.player = new Player(this, 400, (this.floors + 1) * this.floorHeight * this.tileSize);
    this.judy = new Judy(this);
    this.shadow = new Shadow(this, 200, (this.floors + 1) * this.floorHeight * this.tileSize, this.defeatTime);

    //Timer
    this.timer = 0;

    //Camara
    this.cameras.main.setBounds(0, 0, 1280, (this.floors + 1) * this.floorHeight * 32 + 32 * 4);

    this.ropeConstraint = undefined;

    //Agarrarse a la cuerda
    this.onGrabRope();

    //Flechas de marca para la sombra
    this.upArrow = this.addInterfaceImage(this.shadow.x, 32, "up_arrow", {
      x: 0.5,
      y: 0
    }, 0Xf3463a);
    this.downArrow = this.addInterfaceImage(this.shadow.x, height - 32, "down_arrow", {
      x: 0.5,
      y: 1
    }, 0Xffffff);

    //Música
    this.music.play(this.key);
    this.music.setRate(1.5);
    this.music.setMute(this.game.audioConfig.mute);

    //Reseteamos el haber llegado a la cima
    this._reachedTop = false;

    this.startCinematic();
  }

  update(t, dt) {
    super.update(t, dt);
    this.frameTime += dt;

    //Cronómetro
    if (!this._reachedTop && !this.shadowReachedTop && this.hasTimerStarted)
      this.updateTimer(dt);

    //Limitamos forzosamente el framerate a 60fps y los acompasamos con los pasos físicos (por problemas técnicos)
    if (this.frameTime > 16.5) {
      this.frameTime -= 16.5;
      //Actualizar flechas de la sombra
      this.downArrow.setVisible(!this._reachedTop && this.cameras.main.scrollY + this.cameras.main.height < this.shadow.y);
      this.upArrow.setVisible(!this._reachedTop && this.cameras.main.scrollY > this.shadow.y);

      //Condicion de ganar
      if (!this._reachedTop && this.player.y < this.tileSize * (this.floorHeight + this.margin))
        this.win();

      this.matter.world.step();
    }

    if (this.isCinematicFinished) {
      this.cameraRanges.forEach(element => {
        if (this.player.y >= element.min && this.player.y < element.max) {
          this.cameras.main.setBounds(0, element.min - 100, 1280, element.max - element.min + 100);
          this.cameras.main.startFollow(this.player, false, 0.3, 0.3);
        }
      });
    } else {
      this.cameras.main.setBounds(0, 0, 1280, (this.floors + 1) * this.floorHeight * this.tileSize + 2 * this.margin * this.tileSize);
    }
  }

  updateTimer(dt) {
    this.timer = this.timer + dt / 1000;

    // Dos decimales
    this.timerString = this.timer.toFixed(2);
    this.timerText.setText(this.timerString + " ");

    if (this.timer > this.defeatTime)
      this.lose();
  }

  /**
   * Carga la música que se usa en las torres.
   */
  loadMusic() {
    //La sombrá llegará a Judy cuando la música "tower" llegue a estos segundos
    this._loseMusicTime = 320;
    this._startMusicTime = this._loseMusicTime - (this.defeatTime * 1.5);

    this.musicMarker = {
      name: this.key,
      start: this._startMusicTime,
      duration: this.defeatTime * 1.5 + 5
    };

    //Cargamos la musica
    this.music = this.sound.add('tower', this.game.audioConfig);
    this.winMusic = this.sound.add('win', this.game.audioConfig);

    this.music.addMarker(this.musicMarker);
    this.winMusic.addMarker({
      name: "winPart",
      start: 268,
      duration: 7.5
    });

    //Cargamos los sonidos
    this.help_me = this.sound.add('help_me');
    this.fall = this.sound.add('fall');
    this.scream = this.sound.add('scream');
    this.thump = this.sound.add('thump');
    this.sounds = [this.help_me, this.fall, this.scream, this.thump];
    this.sounds.forEach(element => {
      element.setMute(this.game.audioConfig.mute);
    });
  }

  /**
   * Da comienzo al nivel. 
   * Decide si se reproduce la cinemática, o da comienzo a la cuenta atrás directamente.
   */
  startCinematic() {
    this.hasTimerStarted = false;
    this.isCinematicFinished = !this.isThisFirstTime;
    if (this.isThisFirstTime) {
      // Ocurre animación. Llama a judyAnimationEndCallback
      this.help_me.scene = this;
      this.help_me.play();
      this.help_me.once("complete", this.judyAnimationEndCallback);
    } else {
      this.countdown();
    }
  }

  createUI(width, height) {
    // Botón de mute
    let mute = this.game.audioConfig.mute ? 'mute_on' : 'mute_off';
    this.addInterfaceButton(width * 0.05, height * 0.2, mute, 32, function () {
      this.scene.game.audioConfig.mute = !this.scene.game.audioConfig.mute;
      this.scene.music.setMute(!this.scene.music.mute);
      this.scene.winMusic.setMute(!this.scene.winMusic.mute);
      this.scene.sounds.forEach(element => {
        element.setMute(!element.mute);
      });
      this.scene.player.sounds.forEach(element => {
        element.setMute(!element.mute);
      });
      this.scene.judy.sounds.forEach(element => {
        element.setMute(!element.mute);
      });
      this.setTexture(this.scene.game.audioConfig.mute ? 'mute_on' : 'mute_off');
    });

    // Botón volver a SelectScreen
    this.backButton = this.addInterfaceButton(width * 0.05, height * 0.08, 'exit_icon', 50, function () {
      this.scene.music.stop();
      this.scene.scene.start('select');
    });

    // Texto del nombre de la escena: "Torre i"
    let rigthMargin = width - width * 0.05;
    this.addInterfaceText(rigthMargin, height * 0.05, this.key, 50, '#000000');

    // Cronómetro
    this.timerText = this.addInterfaceText(rigthMargin, height * 0.12, this.timer.toString() + " ", 50, '#000000');

    // Límite de tiempo con dos decimales
    this.defeatTimeString = this.defeatTime.toFixed(2);
    this.defeatTimeText = this.addInterfaceText(rigthMargin, height * 0.17, this.defeatTimeString + " ", 30, '#ff0000');
  }

  /**
   * Construye la torre a partir del tilemap cargado
   */
  buildTower() {
    //Tiles
    const map = this.make.tilemap({
      key: this.keyTile
    });

    const tileset = map.addTilesetImage(this.keyTile, 'tiles');
    const backround = map.createLayer('background', tileset);
    this.coll = map.createLayer('Tower', tileset);
    const stairs = map.createLayer('Interactuable', tileset);
    const atravesable = map.createLayer('atravesable', tileset);

    this.stairLayer = stairs;
    this.mapA = map;
    this.stairs = stairs;

    this.createObjects(map);

    this.coll.setCollisionByProperty({
      collides: true
    })

    this.matter.world.convertTilemapLayer(this.coll);
  }

  /**
   * Crea todos los objetos de una torre
   * @param {tilemap} map Tilemap de la torre
   */
  createObjects(map) {
    this.createObject(map, 'cajas', (objeto) => {
      new Box(this, objeto.x, objeto.y);
    });

    this.createObject(map, 'fragmentos', (objeto) => {
      let rec = this.matter.add.image(objeto.x + objeto.width / 2, objeto.y + objeto.height / 2, "fragment");
      rec.label = 'fragmento';
      rec.setSensor(true);
      rec.setStatic(true);
    });

    this.createObject(map, 'escaleras', (objeto) => {
      let rec = this.matter.add.rectangle(objeto.x + objeto.width / 2, objeto.y + objeto.height / 2, objeto.width, objeto.height, {
        label: 'escalera',
        reparada: objeto.properties[2].value,
        pX: objeto.properties[0].value,
        pY: objeto.properties[1].value
      });
      rec.isStatic = true;
      rec.isSensor = true;
    });

    this.createObject(map, 'cuerdas', (objeto) => {
      new Rope(this, objeto.x, objeto.y, objeto.properties[1].value, objeto.properties[0].value);
    });
  }

  /**
   * Creacion objetos desde el JSON
   * @param {tilemap} map Tilemap de la torre
   * @param {string} layerName Nombre de la capa del objeto
   * @param {function} addObject Función que crea y añade el objeto al mundo
   */
  createObject(map, layerName, addObject) {
    if (map.getObjectLayer(layerName) != null) {
      for (const objeto of map.getObjectLayer(layerName).objects) {
        addObject(objeto);
      }
    }
  }

  createAnimations() {
    this.createAnimation('scottie_idle', 153);
    this.createAnimation('scottie_run', 16);
    this.createAnimation('scottie_run_jump', 4);
    this.createAnimation('scottie_run_jump', 6);
    this.createAnimation('scottie_climb', 8);
    this.createAnimation('scottie_push', 11);
    this.createAnimation('scottie_jump', 1);
    this.createAnimation('scottie_hang', 1);
    this.createAnimation('shadow_rise', 6, true);
    this.createAnimation('judy_idle', 6);
    this.createAnimation('judy_fall', 1);
    this.createAnimation('judy_hole', 1);
    this.createAnimation('judy_win', 11);
    this.createAnimation('scottie_win', 9);
    this.createAnimation('scottie_wall_slide', 1);
  }

  /**
   * Se ejecuta al llegar a la cima de la torre.
   */
  win() {
    this._reachedTop = true;

    //Eliminamos UI
    this.destroyUI();

    //Paramos la musica y la sombra
    this.music.stop();
    this.shadow.stop();

    //Desactivar movimiento del jugador
    this.player.setControllable(false);

    //Empieza cinematica
    this.player.setPosition(600, 590);
    this.player.setVelocity(0);
    this.player.setFlipX(false);
    this.player.celebrate();
    this.judy.setPosition(700, 572);
    this.judy.celebrate();
    this.winMusic.play("winPart");
    this.winMusic.setRate(1.5);
    this.winMusic.setMute(this.game.audioConfig.mute);

    //Pasa al siguiente nivel cuando se acabe la musica
    this.winMusic.scene = this;
    this.winMusic.once("complete", this.nextTower);
  }

  destroyUI() {
    this.backButton.destroy(true);
    this.timerText.setColor(this.shadowReachedTop ? '#ff0000' : "#D6D45A");
    this.defeatTimeText.destroy(true);
  }

  /**
   * Carga la siguiente escena. Puede ser la proxima torre o la pantalla de selección de niveles, si no quedan más.
   * También actualiza el record en la torre actual.
   */
  nextTower() {
    let towerNumber = parseInt(this.scene.key[6]);

    //Actualiza Record
    if (this.scene.game.levelsInfo[towerNumber].record === 0 ||
      Number.parseFloat(this.scene.game.levelsInfo[towerNumber].record) > Number.parseFloat(this.scene.timerString)) {
      this.scene.game.levelsInfo[towerNumber].record = this.scene.timerString;
      localStorage.setItem('Tower' + towerNumber, this.scene.timerString);
    }

    if (towerNumber < 5) {
      console.log('Tower ' + (towerNumber + 1));
      this.scene.scene.start('Tower ' + (towerNumber + 1));
    } else {
      this.scene.scene.start('select');
    }
  }

  /**
   * Se ejecuta al acabarse el tiempo.
   */
  lose() {
    this.shadowReachedTop = true;
    this.destroyUI();
    this.music.stop();
    //Animacion de perder
    this.player.stop();
    this.player.setControllable(false);
    this.judy.fall();
    this.isCinematicFinished = false;
    this.cameras.main.startFollow(this.judy);
  }

  /**
   * Recarga la torre para empezar de nuevo.
   */
  repeat() {
    this.shadowReachedTop = false;
    this.scene.start(this.key);
  }

  /**
   * Libera al jugador de la restricción con la cuerda
   */
  freePlayer() {
    this.matter.world.removeConstraint(this.ropeConstraint);
    this.ropeConstraint = undefined;
    setTimeout(this.canGrabRopeAgain, this._grabLastRopeTime, this);
  }

  /**
   * Cuando se llame a esta funcion, el jugador podra volver a agarrar la última cuerda que agarró
   * @param {Phaser.Scene} self Referencia a this para acceder a la variable
   */
  canGrabRopeAgain(self) {
    self._canGrabLastRope = true;
  }

  /**
   * Se ejecuta cuando Judy termina de pedir ayuda. 
   * Comienza el scroll vertical de la cámara para ver la torre hasta llegar a Scottie.
   */
  judyAnimationEndCallback() {
    this.scene.cameras.main.setScroll(0, 0);
    this.scene.cameras.main.pan(0, this.scene.panEnd, this.scene.panSpeed * this.scene.floors, "Cubic.easeInOut", true, this.scene.panEndCallback);
  }

  /**
   * Se ejecuta cuando la cámara llega a Scottie, tras el scroll vertical.
   * Comienza la cuenta atrás
   * @param {camera} camera La cámara principal de la escena
   * @param {number} progress Índice de progreso del scroll
   */
  panEndCallback(camera = null, progress = 0) {
    if (progress === 1) {

      this.isThisFirstTime = false;
      this.countdown();
    }
  }

  /**
   * Comienza la cuenta atrás (3, 2, 1, GO!) y tras ello comienza el timer, la sombra y da control al jugador.
   */
  countdown() {
    this.isCinematicFinished = true;
    this.cameras.main.startFollow(this.player);
    this.createUI(this.cameras.main.width, this.cameras.main.height);

    let number = 3;
    let count = this.addInterfaceText(this.cameras.main.width / 2, this.cameras.main.height / 2,
      ` ${number} `, 120, '#d00000').setOrigin(.5);
    count.setScale(0.7);

    //La cuenta atrás es un timeline que contiene tweens para cada número
    let timeline = this.tweens.createTimeline({
      delay: 500,
      duration: 1000,
      onComplete: this.start
    });
    timeline.scene = this;

    //Añadimos al timeline los 3 números de la cuenta atrás. Son el mismo tween, solo se actualiza el número
    // "GO!" borra el texto
    for (let i = 0; i <= number; i++)
      timeline.add({
        targets: [count],
        scale: 1,
        ease: "Quint.easeOut",
        onComplete: i === 3 ? () => {
          count.destroy();
        } : nextNumber,
      });

    timeline.play();

    function nextNumber() {
      number -= 1;
      count.setScale(0.7);
      count.setText(number === 0 ? " GO! " : ` ${number} `);
    }
  }

  /**
   * Activa el control del jugador, la sombra y el timer para que el juego comience
   */
  start() {
    this.scene.hasTimerStarted = true;
    this.scene.player.setControllable(true);
    this.scene.shadow.start();
  }

  /**
   * Evento que se ejecuta cuando Scottie agarra una cuerda.
   * Crea la constraint necesaria para agarrarlo.
   */
  onGrabRope() {
    this.matter.world.on('collisionstart', (event) => {
      for (let i = 0; i < event.pairs.length; i++) {
        let bodyA = getRootBody(event.pairs[i].bodyA);
        let bodyB = getRootBody(event.pairs[i].bodyB);

        const player = bodyA.gameObject instanceof Player ? bodyA : bodyB;
        const ropes = bodyA.gameObject instanceof Player ? bodyB : bodyA;

        //Puede que ya estemos agarrados a un nodo
        if (player.gameObject instanceof Player && ropes.label === "rope" && this.ropeConstraint === undefined) {
          //Para permitir el salto de una cuerda a otra, 
          //evitaremos engancharnos a otros nodos de la cuerda que acabamos de soltar
          if (this._lastRopeId !== ropes.gameObject.id || this._canGrabLastRope) {
            this.ropeConstraint = this.matter.add.constraint(player,
              ropes,
              0,
              0.5 // rigidez de la unión
            );

            this._canGrabLastRope = false;
            this._lastRopeId = ropes.gameObject.id;
            this.player.changeHang(true);
          }
        }
      }

      function getRootBody(body) {
        if (body.parent === body) {
          return body;
        }
        while (body.parent !== body) {
          body = body.parent;
        }
        return body;
      }
    });
  }

  /**
   * Añade una animación a la escena
   * @param {string} animation_name Nombre de la animación. Debe ser el mismo con el que se cargó su spritesheet
   * @param {integer} num_frames Número de frames de la animación
   */
  createAnimation(animation_name, num_frames, slow = false) {
    this.anims.create({
      key: animation_name,
      frames: this.anims.generateFrameNumbers(animation_name, {
        start: 0,
        end: num_frames - 1
      }),
      frameRate: slow ? 8 : 24,
      repeat: -1
    });
  }

  /**
   * Crea un botón en la interfaz de usuario
   * @param {integer} x Posición en el eje X (esquina superior izquierda)
   * @param {integer} y Posición en el eje Y (esquina superior izquierda)
   * @param {string} textureName Nombre de la textura del botón. Debe ser la misma con la que se cargó.
   * @param {integer} size Tamaño de la textura. Necesaria para la hit area del botón.
   * @param {function} buttonAction Función que se realiza al pulsar el botón
   * @returns {sprite} Devuelve el elemento de la interfaz para poder modificarlo
   */
  addInterfaceButton(x, y, textureName, size, buttonAction) {
    let button = this.add.sprite(x, y, textureName)
      .setInteractive(new Phaser.Geom.Rectangle(size / 2, size / 2, size, size), Phaser.Geom.Rectangle.Contains);
    button.setOrigin(0, 0);
    button.setScrollFactor(0);
    button.setTint("0X000000");

    button.on('pointerdown', buttonAction);

    return button;
  }

  /**
   * Crea un texto en la interfaz de usuario
   * @param {integer} x Posición en el eje X (esquina superior derecha)
   * @param {integer} y Posición en el eje Y (esquina superior derecha)
   * @param {string} s Texto a escribir en el elemento de la interfaz
   * @param {integer} size Tamaño del texto en px
   * @param {string} color Color del texto. Se trata de un string con el código RGB del mismo ('#XXXXXX')
   * @returns {text} Devuelve el elemento de la interfaz para poder modificarlo
   */
  addInterfaceText(x, y, s, size, color) {
    let text = this.add.text(x, y, s, {
      fontFamily: 'Caveat',
      fontSize: size,
      color: color,
      align: 'right'
    });
    text.setOrigin(1, 0);
    text.setScrollFactor(0);

    return text;
  }

  /**
   * Crea una imagen en la interfaz de usuario
   * @param {integer} x Posición en el eje X
   * @param {integer} y Posición en el eje Y
   * @param {string} textureName Nombre de la textura del botón. Debe ser la misma con la que se cargó.
   * @param {object} origin Origen de la textura. Es un objeto con numbers x e y, entre 0 y 1.
   * @param {integer} tint Número hexadecimal del código del color de la tinta. 0Xffffff no tintará la imagen
   * @returns {image} Devuelve el elemento de la interfaz para poder modificarlo
   */
  addInterfaceImage(x, y, textureName, origin, tint) {
    let image = this.add.image(x, y, textureName);
    image.setScrollFactor(0);
    image.setOrigin(origin.x, origin.y);
    image.setTint(tint);

    return image;
  }
}