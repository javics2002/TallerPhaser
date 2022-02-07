import Box from './box.js'
import Rope from './rope.js';
import Player from './player.js';

export default class Castle extends Phaser.Scene {
    constructor() {
        super({
            key: "castle"
        });
    }

    preload() {
        //HACER
        this.loadMusic();
    }

    create() {
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;

        //Tamaño del mapa
        this.matter.world.setBounds(0, 0, 1280, (this.floors + 1) * this.floorHeight * this.tileSize + 2 * this.margin * this.tileSize);

        this.buildTower();

        //Animaciones
        this.createAnimations();

        //Personajes
        this.player = new Player(this, 400, (this.floors + 1) * this.floorHeight * this.tileSize);

        //Camara
        this.cameras.main.setBounds(0, 0, 1280, (this.floors + 1) * this.floorHeight * 32 + 32 * 4);

        //Agarrarse a la cuerda
        this.ropeConstraint = undefined;
        this.onGrabRope();

        //Música
        this.music.play(this.key);
        this.music.setRate(1.5);
        this.music.setMute(this.game.audioConfig.mute);
    }

    update(t, dt) {
        super.update(t, dt);
    }

    /**
     * Construye la torre a partir del tilemap cargado
     */
    buildTower() {
        //Tiles
        const map = this.make.tilemap({
            key: "castle"
        });

        const tileset = map.addTilesetImage("castle", 'tileset');
        const backround = map.createLayer('background', tileset);
        const walls = map.createLayer('tower', tileset);
        this.coll = map.createLayer('ground', tileset);

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
     * Creacion objetos desde el archivo JSON
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

    /**
     * Crea las animaciones que necesitamos en la escena
     */
    createAnimations() {
        //Animaciones de Scottie
        this.createAnimation('scottie_idle', 153);
        this.createAnimation('scottie_run', 16);
        this.createAnimation('scottie_run_jump', 4);
        this.createAnimation('scottie_run_jump', 6);
        this.createAnimation('scottie_climb', 8);
        this.createAnimation('scottie_push', 11);
        this.createAnimation('scottie_jump', 1);
        this.createAnimation('scottie_hang', 1);
        this.createAnimation('scottie_win', 9);
        this.createAnimation('scottie_wall_slide', 1);
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

    /**
   * Carga la música que se usa en las torres.
   */
  loadMusic() {
    //Cargamos la musica
    /*
    this.music = this.sound.add('tower', this.game.audioConfig);
    this.winMusic = this.sound.add('win', this.game.audioConfig);

    //Cargamos los sonidos
    this.help_me = this.sound.add('help_me');
    this.fall = this.sound.add('fall');
    this.scream = this.sound.add('scream');
    this.thump = this.sound.add('thump');
    this.sounds = [this.help_me, this.fall, this.scream, this.thump];
    this.sounds.forEach(element => {
      element.setMute(this.game.audioConfig.mute);
    });*/
  }
}