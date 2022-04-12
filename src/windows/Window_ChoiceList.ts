import {Window_Command} from './Window_Command'
import {Graphics} from '../core/Graphics'
import {global} from '../managers/DataManager'
import {Input} from '../core/Input'

// Window_ChoiceList
//
// The window used for the event command [Show Choices].
export class Window_ChoiceList extends Window_Command {

  private readonly _messageWindow
  private _background = 0

  constructor(messageWindow) {
    super(0, 0)
    this._messageWindow = messageWindow
    this.openness = 0
    this.deactivate()
  }

  start() {
    this.updatePlacement()
    this.updateBackground()
    this.refresh()
    this.selectDefault()
    this.open()
    this.activate()
  }

  selectDefault() {
    this.select(global.$gameMessage.choiceDefaultType())
  }

  updatePlacement() {
    const positionType = global.$gameMessage.choicePositionType()
    const messageY = this._messageWindow.y
    this.width = this.windowWidth()
    this.height = this.windowHeight()
    switch (positionType) {
    case 0:
      this.x = 0
      break
    case 1:
      this.x = (Graphics.boxWidth - this.width) / 2
      break
    case 2:
      this.x = Graphics.boxWidth - this.width
      break
    }
    if (messageY >= Graphics.boxHeight / 2) {
      this.y = messageY - this.height
    } else {
      this.y = messageY + this._messageWindow.height
    }
  }

  updateBackground() {
    this._background = global.$gameMessage.choiceBackground()
    this.setBackgroundType(this._background)
  }

  override windowWidth() {
    const width = this.maxChoiceWidth() + this.padding * 2
    return Math.min(width, Graphics.boxWidth)
  }

  override numVisibleRows() {
    const messageY = this._messageWindow.y
    const messageHeight = this._messageWindow.height
    const centerY = Graphics.boxHeight / 2
    const choices = global.$gameMessage.choices()
    let numLines = choices.length
    let maxLines = 8
    if (messageY < centerY && messageY + messageHeight > centerY) {
      maxLines = 4
    }
    if (numLines > maxLines) {
      numLines = maxLines
    }
    return numLines
  }

  maxChoiceWidth() {
    let maxWidth = 96
    const choices = global.$gameMessage.choices()
    for (let i = 0; i < choices.length; i++) {
      const choiceWidth = this.textWidthEx(choices[i]) + this.textPadding() * 2
      if (maxWidth < choiceWidth) {
        maxWidth = choiceWidth
      }
    }
    return maxWidth
  }

  textWidthEx(text) {
    return this.drawTextEx(text, 0, this.contents.height)
  }

  override contentsHeight() {
    return this.maxItems() * this.itemHeight()
  }

  override makeCommandList() {
    const choices = global.$gameMessage.choices()
    for (let i = 0; i < choices.length; i++) {
      this.addCommand(choices[i], 'choice')
    }
  }

  override drawItem(index) {
    const rect = this.itemRectForText(index)
    this.drawTextEx(this.commandName(index), rect.x, rect.y)
  }

  override isCancelEnabled() {
    return global.$gameMessage.choiceCancelType() !== -1
  }

  override isOkTriggered() {
    return Input.isTriggered('ok')
  }

  override callOkHandler() {
    global.$gameMessage.onChoice(this.index())
    this._messageWindow.terminateMessage()
    this.close()
  }

  override callCancelHandler() {
    global.$gameMessage.onChoice(global.$gameMessage.choiceCancelType())
    this._messageWindow.terminateMessage()
    this.close()
  }
}
