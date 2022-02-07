/**
 * Nodo de una cuerda. Una cuerda está formada por varios nodos.
 */
export default class Node extends Phaser.Physics.Matter.Sprite {
  /**
   * Constructora de la cuerda
   * @param {Tower} scene Escena a la que pertenece el jugador
   * @param {number} x Coordenada X
   * @param {number} y Coordenada Y
   * @param {integer} id Identificador de a qué cuerda pertenezco
   */
  constructor(scene, x, y, id) {
    super(scene.matter.world, x, y, 'rope');
    this.setSensor(true);
    this.scene.add.existing(this);
    this.id = id;
    this.body.label = "rope";
  }
}