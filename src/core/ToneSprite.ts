import * as PIXI from 'pixi.js'
import {Graphics} from './Graphics'
import {Utils} from './Utils'
import {assert} from '../utils'

/**
 * The sprite which changes the screen color in 2D canvas mode.
 *
 * @class ToneSprite
 * @constructor
 */
export class ToneSprite extends PIXI.Container {

  private _red = 0
  private _green = 0
  private _blue = 0
  private _gray = 0

  /**
   * Clears the tone.
   *
   * @method reset
   */
  clear() {
    this._red = 0
    this._green = 0
    this._blue = 0
    this._gray = 0
  }

  /**
   * Sets the tone.
   *
   * @method setTone
   * @param {Number} r The red strength in the range (-255, 255)
   * @param {Number} g The green strength in the range (-255, 255)
   * @param {Number} b The blue strength in the range (-255, 255)
   * @param {Number} gray The grayscale level in the range (0, 255)
   */
  setTone(r = 0, g = 0, b = 0, gray = 0) {
    this._red = Math.round(r).clamp(-255, 255)
    this._green = Math.round(g).clamp(-255, 255)
    this._blue = Math.round(b).clamp(-255, 255)
    this._gray = Math.round(gray).clamp(0, 255)
  }

  protected override _renderCanvas(renderer: PIXI.CanvasRenderer) {
    if (this.visible) {
      const context = renderer.context
      const t = this.worldTransform
      const r = renderer.resolution
      const width = Graphics.width
      const height = Graphics.height
      assert(context !== null)
      context.save()
      context.setTransform(t.a, t.b, t.c, t.d, t.tx * r, t.ty * r)
      if (Graphics.canUseSaturationBlend() && this._gray > 0) {
        context.globalCompositeOperation = 'saturation'
        context.globalAlpha = this._gray / 255
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
      }
      context.globalAlpha = 1
      const r1 = Math.max(0, this._red)
      const g1 = Math.max(0, this._green)
      const b1 = Math.max(0, this._blue)
      if (r1 || g1 || b1) {
        context.globalCompositeOperation = 'lighter'
        context.fillStyle = Utils.rgbToCssColor(r1, g1, b1)
        context.fillRect(0, 0, width, height)
      }
      if (Graphics.canUseDifferenceBlend()) {
        const r2 = Math.max(0, -this._red)
        const g2 = Math.max(0, -this._green)
        const b2 = Math.max(0, -this._blue)
        if (r2 || g2 || b2) {
          context.globalCompositeOperation = 'difference'
          context.fillStyle = '#ffffff'
          context.fillRect(0, 0, width, height)
          context.globalCompositeOperation = 'lighter'
          context.fillStyle = Utils.rgbToCssColor(r2, g2, b2)
          context.fillRect(0, 0, width, height)
          context.globalCompositeOperation = 'difference'
          context.fillStyle = '#ffffff'
          context.fillRect(0, 0, width, height)
        }
      }
      context.restore()
    }
  }
}
