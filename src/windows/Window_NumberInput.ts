import {Window_Selectable} from './Window_Selectable'
import {SoundManager} from '../managers/SoundManager'
import {Input} from '../core/Input'
import {Graphics} from '../core/Graphics'
import {TouchInput} from '../core/TouchInput'
import {Sprite_Button} from '../sprites/Sprite_Button'
import {ImageManager} from '../managers/ImageManager'
import {global} from '../managers/DataManager'
import {Window_Message} from './Window_Message'

// Window_NumberInput
//
// The window used for the event command [Input Number].
export class Window_NumberInput extends Window_Selectable {

  private readonly _messageWindow: Window_Message
  private _number = 0
  private _maxDigits = 1
  private readonly _buttons: Sprite_Button[] = []

  constructor(messageWindow: Window_Message) {
    super()
    this._messageWindow = messageWindow
  }

  override initialize() {
    super.initialize(0, 0, 0, 0)
    this.openness = 0
    this.createButtons()
    this.deactivate()
    return this
  }

  start() {
    this._maxDigits = global.$gameMessage.numInputMaxDigits()
    this._number = global.$gameVariables.value(global.$gameMessage.numInputVariableId())
    this._number = this._number.clamp(0, Math.pow(10, this._maxDigits) - 1)
    this.updatePlacement()
    this.placeButtons()
    this.updateButtonsVisiblity()
    this.createContents()
    this.refresh()
    this.open()
    this.activate()
    this.select(0)
  }

  updatePlacement() {
    const messageY = this._messageWindow.y
    const spacing = 8
    this.width = this.windowWidth()
    this.height = this.windowHeight()
    this.x = (Graphics.boxWidth - this.width) / 2
    if (messageY >= Graphics.boxHeight / 2) {
      this.y = messageY - this.height - spacing
    } else {
      this.y = messageY + this._messageWindow.height + spacing
    }
  }

  windowWidth() {
    return this.maxCols() * this.itemWidth() + this.padding * 2
  }

  windowHeight() {
    return this.fittingHeight(1)
  }

  override maxCols() {
    return this._maxDigits
  }

  override maxItems() {
    return this._maxDigits
  }

  override spacing() {
    return 0
  }

  override itemWidth() {
    return 32
  }

  createButtons() {
    const bitmap = ImageManager.loadSystem('ButtonSet')
    const buttonWidth = 48
    const buttonHeight = 48
    for (let i = 0; i < 3; i++) {
      const button = new Sprite_Button()
      const x = buttonWidth * [1, 2, 4][i]
      const w = buttonWidth * (i === 2 ? 2 : 1)
      button.bitmap = bitmap
      button.setColdFrame(x, 0, w, buttonHeight)
      button.setHotFrame(x, buttonHeight, w, buttonHeight)
      button.visible = false
      this._buttons.push(button)
      this.addChild(button)
    }
    this._buttons[0].setClickHandler(this.onButtonDown.bind(this))
    this._buttons[1].setClickHandler(this.onButtonUp.bind(this))
    this._buttons[2].setClickHandler(this.onButtonOk.bind(this))
  }

  placeButtons() {
    const numButtons = this._buttons.length
    const spacing = 16
    let totalWidth = -spacing
    for (let i = 0; i < numButtons; i++) {
      totalWidth += this._buttons[i].width + spacing
    }
    let x = (this.width - totalWidth) / 2
    for (let j = 0; j < numButtons; j++) {
      const button = this._buttons[j]
      button.x = x
      button.y = this.buttonY()
      x += button.width + spacing
    }
  }

  updateButtonsVisiblity() {
    if (TouchInput.date > Input.date) {
      this.showButtons()
    } else {
      this.hideButtons()
    }
  }

  showButtons() {
    for (let i = 0; i < this._buttons.length; i++) {
      this._buttons[i].visible = true
    }
  }

  hideButtons() {
    for (let i = 0; i < this._buttons.length; i++) {
      this._buttons[i].visible = false
    }
  }

  buttonY() {
    const spacing = 8
    if (this._messageWindow.y >= Graphics.boxHeight / 2) {
      return 0 - this._buttons[0].height - spacing
    } else {
      return this.height + spacing
    }
  }

  override update() {
    super.update()
    this.processDigitChange()
  }

  processDigitChange() {
    if (this.isOpenAndActive()) {
      if (Input.isRepeated('up')) {
        this.changeDigit(true)
      } else if (Input.isRepeated('down')) {
        this.changeDigit(false)
      }
    }
  }

  changeDigit(up: boolean) {
    const index = this.index()
    const place = Math.pow(10, this._maxDigits - 1 - index)
    let n = Math.floor(this._number / place) % 10
    this._number -= n * place
    if (up) {
      n = (n + 1) % 10
    } else {
      n = (n + 9) % 10
    }
    this._number += n * place
    this.refresh()
    SoundManager.playCursor()
  }

  override isTouchOkEnabled() {
    return false
  }

  override isOkEnabled() {
    return true
  }

  override isCancelEnabled() {
    return false
  }

  override isOkTriggered() {
    return Input.isTriggered('ok')
  }

  override processOk() {
    SoundManager.playOk()
    global.$gameVariables.setValue(global.$gameMessage.numInputVariableId(), this._number)
    this._messageWindow.terminateMessage()
    this.updateInputData()
    this.deactivate()
    this.close()
  }

  override drawItem(index: number) {
    const rect = this.itemRect(index)
    const align = 'center'
    const s = this._number.padZero(this._maxDigits)
    const c = s.slice(index, index + 1)
    this.resetTextColor()
    this.drawText(c, rect.x, rect.y, rect.width, align)
  }

  onButtonUp() {
    this.changeDigit(true)
  }

  onButtonDown() {
    this.changeDigit(false)
  }

  onButtonOk() {
    this.processOk()
    this.hideButtons()
  }
}
