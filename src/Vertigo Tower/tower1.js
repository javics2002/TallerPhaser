import Tower from './tower.js';

export default class Tower1 extends Tower {
  constructor() {
    super('Tower 1', 20, 2, 18, 'torre1', [{
      "max": 1721,
      "min": 1145
    }, {
      "max": 1146,
      "min": 636
    }, {
      "max": 635,
      "min": 100
    }], 1400);
  }
}