import {Window_Base} from './Window_Base'
import {Graphics} from '../core/Graphics'
import {Input} from '../core/Input'
import {TouchInput} from '../core/TouchInput'
import {global} from '../managers/DataManager'

// Window_ScrollText
//
// The window for displaying scrolling text. No frame is displayed, but it
// is handled as a window for convenience.
export class Window_ScrollText extends Window_Base {

  private _text = ''
  private _allTextHeight = 0

  override initialize() {
    const width = Graphics.boxWidth
    const height = Graphics.boxHeight
    super.initialize(0, 0, width, height)
    this.opacity = 0
    this.hide()
    return this
  }

  override update() {
    super.update()
    if (global.$gameMessage.scrollMode()) {
      if (this._text) {
        this.updateMessage()
      }
      if (!this._text && global.$gameMessage.hasText()) {
        this.startMessage()
      }
    }
  }

  startMessage() {
    this._text = global.$gameMessage.allText()
    this.refresh()
    this.show()
  }

  refresh() {
    const textState = {index: 0}
    // @ts-ignore
    textState.text = this.convertEscapeCharacters(this._text)
    this.resetFontSettings()
    this._allTextHeight = this.calcTextHeight(textState, true)
    this.createContents()
    this.origin.y = -this.height
    this.drawTextEx(this._text, this.textPadding(), 1)
  }

  override contentsHeight() {
    return Math.max(this._allTextHeight, 1)
  }

  updateMessage() {
    this.origin.y += this.scrollSpeed()
    if (this.origin.y >= this.contents.height) {
      this.terminateMessage()
    }
  }

  scrollSpeed() {
    let speed = global.$gameMessage.scrollSpeed() / 2
    if (this.isFastForward()) {
      speed *= this.fastForwardRate()
    }
    return speed
  }

  isFastForward() {
    if (global.$gameMessage.scrollNoFast()) {
      return false
    } else {
      return (Input.isPressed('ok') || Input.isPressed('shift') ||
        TouchInput.isPressed())
    }
  }

  fastForwardRate() {
    return 3
  }

  terminateMessage() {
    this._text = null
    global.$gameMessage.clear()
    this.hide()
  }
}
