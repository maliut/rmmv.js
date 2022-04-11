import {Sprite} from '../core/Sprite'
import {Bitmap} from '../core/Bitmap'
import {Graphics} from '../core/Graphics'
import {global} from '../managers/DataManager'

// Sprite_Timer
//
// The sprite for displaying the timer.
export class Sprite_Timer extends Sprite {

  private _seconds = 0

  constructor() {
    super()
    this.createBitmap()
    this.update()
  }

  createBitmap() {
    this.bitmap = new Bitmap(96, 48)
    this.bitmap.fontSize = 32
  }

  override update() {
    super.update()
    this.updateBitmap()
    this.updatePosition()
    this.updateVisibility()
  }

  updateBitmap() {
    if (this._seconds !== global.$gameTimer.seconds()) {
      this._seconds = global.$gameTimer.seconds()
      this.redraw()
    }
  }

  redraw() {
    const text = this.timerText()
    const width = this.bitmap.width
    const height = this.bitmap.height
    this.bitmap.clear()
    this.bitmap.drawText(text, 0, 0, width, height, 'center')
  }

  timerText() {
    const min = Math.floor(this._seconds / 60) % 60
    const sec = this._seconds % 60
    return min.padZero(2) + ':' + sec.padZero(2)
  }

  updatePosition() {
    this.x = Graphics.width - this.bitmap.width
    this.y = 0
  }

  updateVisibility() {
    this.visible = global.$gameTimer.isWorking()
  }
}
