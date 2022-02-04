import Node from "./node.js"

/**
 * Cuerda que Scottie agarra para balancearse. 
 * Esta formada por un pivote y varios nodos.
 */
export default class Rope extends Phaser.Physics.Matter.Sprite {
  /**
   * Constructora de la cuerda
   * @param {Tower} scene Escena a la que pertenece el jugador
   * @param {number} x Coordenada X del pivote
   * @param {number} y Coordenada Y del pivote
   * @param {integer} length Número de nodos que cuelgan del pivote
   * @param {integer} id Identificador
   */
  constructor(scene, x, y, length, id) {
    super(scene.matter.world, x, y, 'rope_pivot');
    this.setStatic(true);
    this.setSensor(true);
    this.id = id;

    this.scene.add.existing(this);
    let nodes = new Array(length);
    for (let i = 0; i < length; i++) {
      nodes[i] = new Node(scene, x, y + scene.tileSize * i, id);
      let options = {
        bodyA: i > 0 ? nodes[i - 1] : this,
        bodyB: nodes[i],
        length: 32,
        stiffness: 0.4
      };

      this.scene.matter.add.constraint(options.bodyA, options.bodyB, options.length, options.stiffness);
    }
  }
}