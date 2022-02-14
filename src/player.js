import Box from './box.js'

/**
 * El jugador. Se moverá y saltará usando los controles.
 */
export default class Player extends Phaser.Physics.Matter.Sprite {

  /**
   * Constructor del jugador
   * @param {Tower} scene Escena a la que pertenece el jugador
   * @param {number} x Coordenada X
   * @param {number} y Coordenada Y
   */
  constructor(scene, x, y) {
    super(scene.matter.world, 17, 30, 'scottie_idle');
    this.scene.add.existing(this);

    this.speed = 4;

    //Salto
    this.jumpForce = -.12;
    this.lowJumpMultiplier = .01;
    this.isJumping = false;

    //Cajas
    this.pushSpeed = this.speed * .5;
    this.isPushing = false;

    //Cuerdas
    this.hanged = false;
    this.ropeForce = 0.004;

    //Física
    this.setFixedRotation(true);

    //Input
    this.cursorsArrows = this.scene.input.keyboard.createCursorKeys();
    this.cursorsWASD = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    this.left = () => this.cursorsArrows.left.isDown || this.cursorsWASD.left.isDown;
    this.right = () => this.cursorsArrows.right.isDown || this.cursorsWASD.right.isDown;
    this.up = () => this.cursorsArrows.up.isDown || this.cursorsWASD.up.isDown;
    this.down = () => this.cursorsArrows.down.isDown || this.cursorsWASD.down.isDown;
    this.jump = () => this.cursorsArrows.up.isDown ||
      this.cursorsWASD.up.isDown || this.cursorsWASD.jump.isDown;

    //Sensores. El de abajo detecta el suelo y los de los lados, cajas
    let bodies = Phaser.Physics.Matter.Matter.Bodies;
    this.bottomSensor = bodies.rectangle(this.x, this.y + this.height / 2, this.width / 2, 15, {
      isSensor: true
    });
    this.leftSensor = bodies.rectangle(this.x - this.width / 2, this.y, 15, this.height / 2, {
      isSensor: true
    });
    this.rightSensor = bodies.rectangle(this.x + this.width / 2, this.y, 15, this.height / 2, {
      isSensor: true
    });
    this.setExistingBody(bodies.rectangle(this.x, this.y, this.width, this.height, {
      chamfer: {
        radius: 10
      }
    }), true);

    //Une el jugador a los sensores para detectar el suelo y las paredes
    let compoundBody = Phaser.Physics.Matter.Matter.Body.create({
      parts: [this.body, this.bottomSensor, this.leftSensor, this.rightSensor],
      restitution: 0.05 //Para no engancharse a las paredes
    });
    this.setExistingBody(compoundBody);
    this.setFixedRotation();
    this.setPosition(x, y);

    scene.matter.world.on("beforeupdate", this.resetTouching, this);

    this.isTouching = {
      left: false,
      right: false
    };

    this.setCollissions(getRootBody, scene);

    //en caso de ser un objeto compuesto por mas recojo el principal(preventivo)
    function getRootBody(body) {
      if (body.parent === body) {
        return body;
      }
      while (body.parent !== body) {
        body = body.parent;
      }
      return body;
    }

    //Cargamos los sonidos que produce el jugador
    this.fix_stairs = scene.sound.add('fix_stairs');
    this.jumpSound = scene.sound.add('jump');
    this.ladder1 = scene.sound.add('ladder1');
    this.ladder2 = scene.sound.add('ladder2');
    this.pick_up = scene.sound.add('pick_up');
    this.push_box = scene.sound.add('push_box');

    this.sounds = [this.fix_stairs, this.jumpSound, this.ladder1, this.ladder2, this.pick_up, this.push_box];
    this.sounds.forEach(element => {
      element.setMute(scene.game.audioConfig.mute);
    });

    //Sonidos enlazados a animaciones
    this.on('animationrepeat', (animation) => {
      if (animation.key === "scottie_push")
        this.push_box.play();
    });

    //Comenzamos la animación
    this.play("scottie_idle");
  }

  /**
   * Métodos preUpdate de Phaser. Se encarga del control del jugador cada frame
   * @override
   */
  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    //Hacemos los controles
    //Para saber si hemos pulsado los botones, podemos usar this.right(), this.left(), this.up(), this.down(), this.jump()
    //Si pulsamos el boton de ir a la derecha, le decimos a que su velocidad sea this.speed con this.setVelocityX(numero);
    //Podemos poner la animacion de andar con this.play('scottie_run', true);
    //y la de estar quieto con this.play('scottie_idle', true);


    //Con esto, nos daremos la vuelta si vamos a la izquierda
    this.setFlipX(this.left());

    //El salto es un poco mas complicado. No solo tenemos que comprobar la tecla de salto, 
    //sino también que no estemos saltando ya (lo podemos saber con this.isJumping)
    //y que no hayamos saltado ya antes (lo podemos saber con this.jumpDown).
    //Para preguntar que NO haya pasado esto ponemos ! al principio:
    //Por ejemplo: si estoy saltando es "this.isJumping"
    //si no estoy saltando es "!this.isJumping"
    if ( false ) {
      //Saltamos aplicando una fuerza hacia arriba
      //Lo normal es que x sea 0 y la y sea this.jumpForce
      this.applyForce({
        x: 0,
        y: 0
      });
      this.jumpSound.play();

      //Hemos saltado
      this.jumpDown = true;
      this.isJumping = true;

      //Animacion de salto
      this.play("scottie_jump", true);
    }

    //Solo 1 salto por pulsación. Podeis borrarlo si quereis saltar muchas veces manteniendo pulsado
    if (!this.jump() && this.jumpDown) {
      this.jumpDown = false;
    }
  }

  /**
   * Balancea al jugador a los lados cuando está agarrado en una cuerda, y lo suelta si pulsamos jump.
   */
  swing() {
    if (this.jump() && !this.jumpDown) {
      //Se suelta de la cuerda
      this.hanged = false;
      this.scene.freePlayer();
    } else if (this.left())
      this.applyForce({
        x: -this.ropeForce,
        y: 0
      });
    else if (this.right())
      this.applyForce({
        x: this.ropeForce,
        y: 0
      });

    this.play("scottie_hang", true);
  }

  /**
   * Suelta o agarra el jugador a una cuerda
   * @param {boolean} hanged true si el jugador se ha agarrado a una cuerda o false si se ha soltado
   */
  changeHang(hanged) {
    this.hanged = hanged;
  }

  /**
   * Cambia si podemos controlar al jugador o no, para separar las cinemáticas iniciales y finales del juego.
   * @param {boolean} controllable true para controlar al jugador, false para perder el control y que se quede quieto
   */
  setControllable(controllable) {
    this.canMove = controllable;
  }

  /**
   * Reproduce la animación de ganar
   */
  celebrate() {
    this.play("scottie_win");
  }

  /**
   * Nos suscribimos a los eventos que gestionan las colisiones con el resto de objetos
   * @param {function} getRootBody Devuelve el body del padre
   * @param {Phaser.Scene} scene Referencia a la escena
   */
  setCollissions(getRootBody, scene) {
    this.scene.matter.world.on("collisionactive", (event) => {
      let pushingBox = false;

      for (let i = 0; i < event.pairs.length; i++) {

        let bodyA = event.pairs[i].bodyA;
        let bodyB = event.pairs[i].bodyB;

        const player = bodyA.label === 'player' ? bodyA : bodyB;
        const tile = bodyA.label === 'player' ? bodyB : bodyA;
        const mainBody = getRootBody(tile);
        const {
          gameObject
        } = mainBody;

        // Punto de interrupción: Comprobar bodyAs y bodyBs, ¿Se registran?
        if (bodyA === this.bottomSensor || bodyB === this.bottomSensor && tile.label !== 'escalera') {
          this.isJumping = false;
          this.coyoteCounter = this.coyoteTime;
        }

        //en caso de colisionar con una pared , pongo isTouching a true para que deje de aplicar fuerzas en X
        this.collissionWall(gameObject, bodyA, bodyB);

        if (!pushingBox)
          pushingBox = this.collissionBox(bodyA, bodyB);
      }

      this.isPushing = pushingBox;
    });
  }

  /**
   * Comprueba si estamos empujando una caja o no
   * @param {Matter.body} bodyA 
   * @param {Matter.body} bodyB 
   * @returns Devuelve si estamos empujando una caja o no
   */
  collissionBox(bodyA, bodyB) {
    //Colisión con cajas
    const sideSensor = bodyA === this.leftSensor || bodyA === this.rightSensor ||
      bodyB === this.leftSensor || bodyB === this.rightSensor;
    const box = bodyA.gameObject instanceof Box || bodyB.gameObject instanceof Box;
    return sideSensor && box;
  }

  /**
   * Comprueba si estamos tocando una pared y actualiza los marcadores isTouching
   * @param {gameObject} gameObject Objeto con el que colisiona el jugador
   * @param {Matter.body} bodyA 
   * @param {Matter.body} bodyB 
   */
  collissionWall(gameObject, bodyA, bodyB) {
    if (gameObject != null && gameObject.tile != null) {
      if (bodyA === this.leftSensor || bodyB === this.leftSensor) {
        this.isTouching.left = true;
      } else if (bodyA === this.rightSensor || bodyB === this.rightSensor) {
        this.isTouching.right = true;
      }
    }
  }

  /**
   * reseteo la deteccion de colisiones cada frame tanto al haber tocado paredes como suelo
   */
  resetTouching() {
    this.isTouching.left = false;
    this.isTouching.right = false;
    this.isTouching.ground = false;
  }
}