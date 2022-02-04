import Tower from './tower.js';

export default class Tower3 extends Tower {
  constructor() {
    super('Tower 3', 60, 6, 18,'torre3', [{"max": 4020, "min": 3460},
    {"max": 3459, "min": 2870},
    {"max": 2869, "min": 2295},
    {"max": 2294, "min": 1741},
    {"max": 1740, "min":640},
    {"max": 639, "min":100}],
     3900);
    this.isCinematicFinished = false;
  }
}