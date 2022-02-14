import Box from './box.js'
import Rope from './rope.js';
import Player from './player.js';
import Coin from './coin.js';

export default class Castle extends Phaser.Scene {
    constructor() {
        super({
            key: "castle"
        });
    }

    preload() {
        this.loadMusic();
    }

    create() {
        //Tamaño del mapa
        this.matter.world.setBounds(0, 0, 1920, 960);
        this.tileSize = 32;

        //Monedas
        this.monedas = 0; //Monedas que tenemos
        this.monedasTotales = 0; //Monedas que hay en el mapa

        //Animaciones
        this.createAnimations();

        //Construimos el mapa
        this.construirMapa();

        //Creamos el jugador
        //Tenemos que decirle que el jugador de la escena es un new Player
        //(this.player = new Player(this, x, y))
        //Podemos empezar donde queramos, pero recomiendo empezar en (400, 800)

        //Camara
        this.cameras.main.setBounds(0, 0, 1920, 960);
        //Ahora le tenemos que decir a this.cameras.main que
        //empiece a seguir al jugador con .startFollow(this.player)

        //Agarrarse a la cuerda
        this.ropeConstraint = undefined;
        this.onGrabRope();

        //Coger monedas
        this.colisionConMoneda();

        //Música
        this.music.play();
        this.music.setRate(1.5);
        this.music.setVolume(0.5);
        this.music.setMute(this.game.audioConfig.mute);
    }

    update(t, dt) {
        super.update(t, dt);

        //Si tenemos todas las monedas, terminamos el juego cambiando a la escena "end"
        //¿Recuerdas cómo se cambia de escena?
    }

    cogerMoneda() {
        this.monedas++;
    }

    colisionConMoneda() {
        this.matter.world.on('collisionstart', (event) => {
            for (let i = 0; i < event.pairs.length; i++) {
                let bodyA = getRootBody(event.pairs[i].bodyA);
                let bodyB = getRootBody(event.pairs[i].bodyB);

                const player = bodyA.gameObject instanceof Player ? bodyA : bodyB;
                const moneda = bodyA.gameObject instanceof Player ? bodyB : bodyA;

                //Si el jugador colisiona con una moneda
                if (player.gameObject instanceof Player && moneda.gameObject instanceof Coin) {
                    moneda.gameObject.destruir();
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
     * Construye la torre a partir del tilemap cargado
     */
    construirMapa() {
        //Tiles
        const map = this.make.tilemap({
            key: "castle"
        });

        const tileset = map.addTilesetImage("atlas", "tileset");
        const backround = map.createLayer('background', tileset);
        const walls = map.createLayer('tower', tileset);
        this.ground = map.createLayer('ground', tileset);

        this.createObjects(map);

        this.ground.setCollisionBetween(0, 24);

        this.matter.world.convertTilemapLayer(this.ground);
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

        this.createObject(map, 'monedas', (objeto) => {
            new Coin(this, objeto.x, objeto.y);
            this.monedasTotales++;
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
        this.createAnimation('scottie_push', 11);
        this.createAnimation('scottie_jump', 1);
        this.createAnimation('scottie_hang', 1);
        this.createAnimation('scottie_win', 9);
        this.createAnimation('scottie_wall_slide', 1);
        this.createAnimation('coin', 6, true);
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
        this.music = this.sound.add('tower', this.game.audioConfig);

        //Cargamos los sonidos
        this.coinSound = this.sound.add("coin");
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
     * Libera al jugador de la restricción con la cuerda
     */
    freePlayer() {
        this.matter.world.removeConstraint(this.ropeConstraint);
        this.ropeConstraint = undefined;
        setTimeout(this.canGrabRopeAgain, 100, this);
    }

    /**
     * Cuando se llame a esta funcion, el jugador podra volver a agarrar la última cuerda que agarró
     * @param {Phaser.Scene} self Referencia a this para acceder a la variable
     */
    canGrabRopeAgain(self) {
        self._canGrabLastRope = true;
    }
}