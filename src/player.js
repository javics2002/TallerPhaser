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

    this.speed = 6;

    //Salto
    this.jumpForce = -.2;
    this.lowJumpMultiplier = .01;
    this.isJumping = false;

    // Coyote Time: podemos saltar en el aire un poco después de salirnos de una plataforma
    this.coyoteTime = 100;
    this.coyoteCounter = 0;

    // Jump Buffer: podemos pulsar el botón de salto antes de tocar el suelo y saltar automáticamente en cuando lo toquemos
    this.jumpBufferLength = 100;
    this.jumpBufferCounter = 0;

    //Marcamos si podemos subir unas escaleras
    this.canClimb = false;

    //Cajas
    this.pushSpeed = this.speed * .5;
    this.isPushing = false;

    //Cuerdas
    this.hanged = false;
    this.ropeForce = 0.004;

    this.hasStairs = false;

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

    //Control
    this.canMove = false; //Se desactiva en las cinemáticas

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
    this.stair = bodies.rectangle(this.x, this.y + this.height / 2 - 7.5, this.width / 2, 15, {
      isSensor: true
    });

    this.setExistingBody(bodies.rectangle(this.x, this.y, this.width, this.height, {
      chamfer: {
        radius: 10
      }
    }), true);
    let compoundBody = Phaser.Physics.Matter.Matter.Body.create({
      parts: [this.body, this.bottomSensor, this.leftSensor, this.rightSensor, this.stair],
      restitution: 0.05 //Para no engancharse a las paredes
    });

    this.setExistingBody(compoundBody);
    this.setFixedRotation();
    this.setPosition(x, y);

    //creacion del fragmento superior player
    this.fragment = this.scene.matter.add.image(0, 0, "fragment");
    //this.frag.setIgnoreGravity(true);   
    this.fragment.setSensor(true);
    this.fragment.setStatic(true);
    this.fragment.visible = false;

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


    //escaleras
    this.brokenStair = false;

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
      if (animation.key === "scottie_climb") {
        //Se alternan los sonidos
        this.lastLadderSound = !this.lastLadderSound;
        if (this.lastLadderSound)
          this.ladder1.play();
        else
          this.ladder2.play();
      } else if (animation.key === "scottie_push")
        this.push_box.play();
    });

    //Comenzamos la animación
    this.play("scottie_idle");
  }

  /**
   * Métodos preUpdate de Phaser. Se encarga del control del jugador
   * @override
   */
  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    this.updateFragment();

    //Controles
    if (this.canMove) {
      if (!this.hanged) {
        this.horizontalMovement();

        if (!this.canClimb) {
          //Control estándar
          this.jumpPerformance(dt);

          if (this.isJumping && (this.isTouching.left || this.isTouching.right))
            this.play("scottie_wall_slide", true);
        } else
          //Control escalando
          this.climbStairs();
      } else
        //Controles agarrado a una cuerda
        this.swing();

      //Solo 1 salto por pulsación
      if (!this.jump() && this.jumpDown) {
        //Soltamos el boton y por tanto se cancela la aplicación de velocidad ascendente
        this.jumpDown = false;
      }
    } else
      this.setVelocityX(0);
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
        if (bodyA === this.bottomSensor || bodyB === this.bottomSensor && tile.label !== 'escalera' && !this.canClimb) {
          this.isJumping = false;
          this.coyoteCounter = this.coyoteTime;
        }
        //en caso de colision con una escalera
        this.collissionStairs(bodyA, bodyB, tile, scene);

        //en caso de colisionar con un fragmento de escalera
        this.collissionFragment(gameObject, bodyA, bodyB);

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
   * Comprueba si chocamos con un fragmento de escalera para recogerlo
   * @param {gameObject} gameObject Objeto con el que colisiona el jugador
   * @param {Matter.body} bodyA 
   * @param {Matter.body} bodyB 
   */
  collissionFragment(gameObject, bodyA, bodyB) {
    if (gameObject != null && gameObject.type === 'Image' &&
      (bodyA === this.leftSensor && gameObject.label === 'fragmento' ||
        bodyB === this.rightSensor && gameObject.label === 'fragmento')) {
      //lo recojo y destruyo el objeto
      this.fragment.visible = true;
      this.puedeReparar = true;
      this.hasStairs = true;
      this.pick_up.play();

      gameObject.destroy();
    }
  }

  /**
   * Detecta colisiones con las escaleras. Si puedo repararla, la reparo.
   * @param {Matter.body} bodyA 
   * @param {Matter.body} bodyB 
   * @param {Matter.body} tile Tile con el que colisiono
   * @param {Phaser.Scene} scene Referencia a la escena
   */
  collissionStairs(bodyA, bodyB, tile, scene) {
    if ((bodyA === this.bottomSensor && bodyB.label === 'escalera' || bodyB === this.bottomSensor && bodyA.label === 'escalera' ||
        bodyA === this.leftSensor && bodyB.label === 'escalera' || bodyB === this.leftSensor && bodyA.label === 'escalera' ||
        bodyA === this.rightSensor && bodyB.label === 'escalera' || bodyB === this.rightSensor && bodyA.label === 'escalera' ||
        bodyA === this.stair && bodyB.label === 'escalera' || bodyB === this.stair && bodyA.label === 'escalera')) {
      // si la escalera esta reparada la escalo
      if (tile.reparada) {
        this.canClimb = true;
        this.isJumping = true;
        //si no esta reparada y he recogido un fragmento antes cambio el sprite de los 
        //tiles en una zona de rotos a reparados
      } else if (this.puedeReparar) {
        this.fix_stairs.play();
        scene.mapA.replaceByIndex(3, 7, tile.pX, tile.pY, 2, 6, scene.stairs);
        scene.mapA.replaceByIndex(4, 8, tile.pX, tile.pY, 2, 6, scene.stairs);
        scene.mapA.replaceByIndex(5, 7, tile.pX, tile.pY, 2, 6, scene.stairs);
        scene.mapA.replaceByIndex(6, 8, tile.pX, tile.pY, 2, 6, scene.stairs);
        //reestablezco las variables de usar escaleras
        this.fragment.visible = false;
        tile.reparada = true;
        this.hasStairs = false;
        this.puedeReparar = false;
        this.fragment.x = 0;
        this.fragment.y = 0;
      }
    }
  }

  /**
   * actualizo la posicion del fragmento encima de scottie en caso de haber recogido uno
   */
  updateFragment() {
    if (this.hasStairs) {
      this.fragment.x = this.x;
      this.fragment.y = this.y - this.height;
    }
  }

  /**
   * reseteo la deteccion de colisiones cada frame tanto al haber tocado paredes como suelo
   */
  resetTouching() {
    this.isTouching.left = false;
    this.isTouching.right = false;
    this.isTouching.ground = false;
    this.canClimb = false;
  }

  /**
   * Se encarga del movimiento horizontal del jugador. Actualiza su velocidad y animación en el eje X.
   */
  horizontalMovement() {
    if (this.right() && !this.isTouching.right)
      move(true, this);
    else if (this.left() && !this.isTouching.left)
      move(false, this);
    else
      stop(this);

    /**
     * Mueve al jugador horizontalmente. 
     * Cambia la velocidad, empieza la animación y también invierte su sprite para orientarlo en la dirección correcta.
     * @param {boolean} right true si se mueve a la derecha, false si se mueve a la izquierda
     * @param {Player} self referencia al player
     */
    function move(right, self) {
      let speed = self.isPushing ? self.pushSpeed : self.speed;
      self.setVelocityX(right ? speed : -speed);
      self.setFlipX(!right);
      if (!self.canClimb && !self.isJumping)
        self.play(self.isPushing ? 'scottie_push' : 'scottie_run', true);
    }

    /**
     * Pone la velocidad a 0 y empieza la animación de idle
     * @param {Player} self referencia al player
     */
    function stop(self) {
      self.setVelocityX(0);
      if (!self.canClimb && !self.isJumping)
        self.play('scottie_idle', true);
    }
  }

  /**
   * Se encarga del movimiento vertical del jugador estandar, es decir, de cuando saltamos.
   * @param {number} dt deltatime
   */
  jumpPerformance(dt) {
    this.setIgnoreGravity(false);

    if ((this.jump() && !this.jumpDown || this.jumpBufferCounter > 0) && this.coyoteCounter > 0 && !this.isJumping) {
      this.jumpDown = true;
      this.isJumping = true;
      this.applyForce({
        x: 0,
        y: this.jumpForce
      });
      this.jumpSound.play();

      //Si se ha saltado por el buffer, lo reseteamos
      if (this.jumpBufferCounter > 0)
        this.jumpBufferCounter = 0;
    }

    //Jump Buffer. Si ya estamos saltando, guardamos la pulsación en el buffer
    else if (this.jump() && !this.jumpDown && this.isJumping && this.jumpBufferCounter <= 0)
      this.jumpBufferCounter = this.jumpBufferLength;

    if (this.isJumping && this.body.velocity.y < -0.1 && !this.jump())
      this.applyForce({
        x: 0,
        y: this.lowJumpMultiplier
      });

    //Animación
    if (this.isJumping && !this.isTouching.left && !this.isTouching.right)
      this.play("scottie_jump", true);

    //Timers
    this.coyoteCounter -= dt;
    this.jumpBufferCounter -= dt;
  }

  /**
   * Se encarga del control en el escalado de escaleras
   */
  climbStairs() {
    this.setIgnoreGravity(true);

    if (this.up())
      move(true, this);
    else if (this.down())
      move(false, this);
    else
      stop(this);

    /**
     * Mueve al jugador verticalmente. 
     * Cambia la velocidad vertical y reproduce la alimación de subir las escaleras.
     * @param {boolean} up true si se mueve hacia arriba, false si se mueve abajo
     * @param {Player} self referencia al player
     */
    function move(up, self) {
      self.setVelocityY(up ? -self.speed : self.speed);
      self.play('scottie_climb', true);
    }

    /**
     * Pone la velocidad a 0 y para la animacion
     * @param {Player} self referencia al player
     */
    function stop(self) {
      self.play('scottie_climb', true);
      self.stop();
      self.setVelocityY(0);
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
}