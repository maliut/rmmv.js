import {Sprite} from '../core/Sprite'
import {TouchInput} from '../core/TouchInput'
import {Rectangle} from '../core/Rectangle'
import * as PIXI from 'pixi.js'

export class Sprite_Button extends Sprite {

  private _touching = false
  private _coldFrame: Rectangle | null = null
  private _hotFrame: Rectangle | null = null
  private _clickHandler: (() => void) | null = null

  override update() {
    super.update()
    this.updateFrame()
    this.processTouch()
  }

  updateFrame() {
    let frame: Rectangle | null
    if (this._touching) {
      frame = this._hotFrame
    } else {
      frame = this._coldFrame
    }
    if (frame) {
      this.setFrame(frame.x, frame.y, frame.width, frame.height)
    }
  }

  setColdFrame(x: number, y: number, width: number, height: number) {
    this._coldFrame = new Rectangle(x, y, width, height)
  }

  setHotFrame(x: number, y: number, width: number, height: number) {
    this._hotFrame = new Rectangle(x, y, width, height)
  }

  setClickHandler(method: (() => void) | null) {
    this._clickHandler = method
  }

  callClickHandler() {
    this._clickHandler?.()
  }

  processTouch() {
    if (this.isActive()) {
      if (TouchInput.isTriggered() && this.isButtonTouched()) {
        this._touching = true
      }
      if (this._touching) {
        if (TouchInput.isReleased() || !this.isButtonTouched()) {
          this._touching = false
          if (TouchInput.isReleased()) {
            this.callClickHandler()
          }
        }
      }
    } else {
      this._touching = false
    }
  }

  isActive() {
    let node = this as PIXI.Container
    while (node) {
      if (!node.visible) {
        return false
      }
      node = node.parent
    }
    return true
  }

  isButtonTouched() {
    const x = this.canvasToLocalX(TouchInput.x)
    const y = this.canvasToLocalY(TouchInput.y)
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  canvasToLocalX(x) {
    let node = this as PIXI.Container
    while (node) {
      x -= node.x
      node = node.parent
    }
    return x
  }

  canvasToLocalY(y) {
    let node = this as PIXI.Container
    while (node) {
      y -= node.y
      node = node.parent
    }
    return y
  }
}
