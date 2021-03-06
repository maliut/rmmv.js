import {Sprite_Base} from './Sprite_Base'
import {ImageManager} from '../managers/ImageManager'

// Sprite_Balloon
//
// The sprite for displaying a balloon icon.
export class Sprite_Balloon extends Sprite_Base {

  private _balloonId = 0
  private _duration = 0
  z = 7

  constructor() {
    super()
    this.anchor.x = 0.5
    this.anchor.y = 1
    this.loadBitmap()
  }

  loadBitmap() {
    this.bitmap = ImageManager.loadSystem('Balloon')
    this.setFrame(0, 0, 0, 0)
  }

  setup(balloonId: number) {
    this._balloonId = balloonId
    this._duration = 8 * this.speed() + this.waitTime()
  }

  override update() {
    super.update()
    if (this._duration > 0) {
      this._duration--
      if (this._duration > 0) {
        this.updateFrame()
      }
    }
  }

  updateFrame() {
    const w = 48
    const h = 48
    const sx = this.frameIndex() * w
    const sy = (this._balloonId - 1) * h
    this.setFrame(sx, sy, w, h)
  }

  speed() {
    return 8
  }

  waitTime() {
    return 12
  }

  frameIndex() {
    const index = (this._duration - this.waitTime()) / this.speed()
    return 7 - Math.max(Math.floor(index), 0)
  }

  isPlaying() {
    return this._duration > 0
  }
}
