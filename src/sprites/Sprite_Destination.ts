import {Sprite} from '../core/Sprite'
import {Bitmap} from '../core/Bitmap'
import {Graphics} from '../core/Graphics'
import {global} from '../managers/DataManager'

// Sprite_Destination
//
// The sprite for displaying the destination place of the touch input.
export class Sprite_Destination extends Sprite {

  private _frameCount = 0

  constructor() {
    super()
    this.createBitmap()
  }

  override update() {
    super.update()
    if (global.$gameTemp.isDestinationValid()) {
      this.updatePosition()
      this.updateAnimation()
      this.visible = true
    } else {
      this._frameCount = 0
      this.visible = false
    }
  }

  createBitmap() {
    const tileWidth = global.$gameMap.tileWidth()
    const tileHeight = global.$gameMap.tileHeight()
    this.bitmap = new Bitmap(tileWidth, tileHeight)
    this.bitmap.fillAll('white')
    this.anchor.x = 0.5
    this.anchor.y = 0.5
    this.blendMode = Graphics.BLEND_ADD
  }

  updatePosition() {
    const tileWidth = global.$gameMap.tileWidth()
    const tileHeight = global.$gameMap.tileHeight()
    const x = global.$gameTemp.destinationX()!
    const y = global.$gameTemp.destinationY()!
    this.x = (global.$gameMap.adjustX(x) + 0.5) * tileWidth
    this.y = (global.$gameMap.adjustY(y) + 0.5) * tileHeight
  }

  updateAnimation() {
    this._frameCount++
    this._frameCount %= 20
    this.opacity = (20 - this._frameCount) * 6
    this.scale.y = this.scale.x = 1 + this._frameCount / 20
  }
}
