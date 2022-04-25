import * as PIXI from 'pixi.js'

/**
 * The root object of the display tree.
 *
 * @class Stage
 * @constructor
 */
export class Stage extends PIXI.Container {

  // The interactive flag causes a memory leak.
  interactive = false

}
