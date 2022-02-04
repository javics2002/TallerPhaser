import Tower from './tower.js';

export default class Tower4 extends Tower {
  constructor() {
    super('Tower 4', 120, 8, 18,'torre4',
     [{"max": 5070, "min": 4600},
    {"max": 4599, "min": 4050},
    {"max": 4049, "min":2870},
    {"max": 2869, "min":2310},
    {"max": 2309, "min":1150},
    {"max": 1149, "min":640},
    {"max": 639, "min":200}],
     4870);
  }
}