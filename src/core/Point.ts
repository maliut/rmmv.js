import * as PIXI from 'pixi.js'

export class Point extends PIXI.Point {
  /**
   * The point class.
   *
   * @class Point
   * @constructor
   * @param {Number} x The x coordinate
   * @param {Number} y The y coordinate
   */
  constructor(x?: number, y?: number) {
    super(x, y)
  }
}
