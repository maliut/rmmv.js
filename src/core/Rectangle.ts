import * as PIXI from 'pixi.js'

export class Rectangle extends PIXI.Rectangle {
  /**
   * The rectangle class.
   *
   * @class Rectangle
   * @constructor
   * @param {Number} x The x coordinate for the upper-left corner
   * @param {Number} y The y coordinate for the upper-left corner
   * @param {Number} width The width of the rectangle
   * @param {Number} height The height of the rectangle
   */
  constructor(x?: number, y?: number, width?: number, height?: number) {
    super(x, y, width, height)
  }

  /**
   * @static
   * @property emptyRectangle
   * @type Rectangle
   */
  static emptyRectangle = new Rectangle(0, 0, 0, 0)
}
