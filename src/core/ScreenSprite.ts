import * as PIXI from 'pixi.js'
import {Utils} from './Utils'
import {Graphics} from './Graphics'

/**
 * The sprite which covers the entire game screen.
 */
export class ScreenSprite extends PIXI.Container {

  private readonly _graphics: PIXI.Graphics
  private _red = -1
  private _green = -1
  private _blue = -1
  private _colorText = ''

  /**
   * The opacity of the sprite (0 to 255).
   *
   * @property opacity
   * @type Number
   */
  get opacity() {
    return this.alpha * 255
  }

  set opacity(value) {
    this.alpha = value.clamp(0, 255) / 255
  }

  get anchor() {
    ScreenSprite.warnYep()
    this.scale.x = 1
    this.scale.y = 1
    return {x: 0, y: 0}
  }

  /**
   * The sprite which covers the entire game screen.
   *
   * @class ScreenSprite
   * @constructor
   */
  constructor() {
    super()
    this._graphics = new PIXI.Graphics()
    this.addChild(this._graphics)
    this.opacity = 0
    this.setBlack()
  }

  static YEPWarned = false
  static warnYep() {
    if (!ScreenSprite.YEPWarned) {
      console.log('Deprecation warning. Please update YEP_CoreEngine. ScreenSprite is not a sprite, it has graphics inside.')
      ScreenSprite.YEPWarned = true
    }
  }

  /**
   * Sets black to the color of the screen sprite.
   *
   * @method setBlack
   */
  setBlack() {
    this.setColor(0, 0, 0)
  }

  /**
   * Sets white to the color of the screen sprite.
   *
   * @method setWhite
   */
  setWhite() {
    this.setColor(255, 255, 255)
  }

  /**
   * Sets the color of the screen sprite by values.
   *
   * @method setColor
   * @param {Number} r The red value in the range (0, 255)
   * @param {Number} g The green value in the range (0, 255)
   * @param {Number} b The blue value in the range (0, 255)
   */
  setColor(r, g, b) {
    if (this._red !== r || this._green !== g || this._blue !== b) {
      r = Math.round(r || 0).clamp(0, 255)
      g = Math.round(g || 0).clamp(0, 255)
      b = Math.round(b || 0).clamp(0, 255)
      this._red = r
      this._green = g
      this._blue = b
      this._colorText = Utils.rgbToCssColor(r, g, b)

      const graphics = this._graphics
      graphics.clear()
      const intColor = (r << 16) | (g << 8) | b
      graphics.beginFill(intColor, 1)
      //whole screen with zoom. BWAHAHAHAHA
      graphics.drawRect(-Graphics.width * 5, -Graphics.height * 5, Graphics.width * 10, Graphics.height * 10)
    }
  }
}
