import {Window_Base} from './Window_Base'
import {Graphics} from '../core/Graphics'
import {Input} from '../core/Input'
import {TouchInput} from '../core/TouchInput'
import {Window_Gold} from './Window_Gold'
import {Window_ChoiceList} from './Window_ChoiceList'
import {Window_NumberInput} from './Window_NumberInput'
import {Window_EventItem} from './Window_EventItem'
import {Utils} from '../core/Utils'
import {global} from '../managers/DataManager'
import {ImageManager} from '../managers/ImageManager'
import {Bitmap} from '../core/Bitmap'
import {TextState} from '../types/index'

// Window_Message
//
// The window for displaying text messages.
export class Window_Message extends Window_Base {

  private readonly _imageReservationId = Utils.generateRuntimeId()
  private _background = 0
  private _positionType = -2
  private _waitCount = 0
  private _faceBitmap: Bitmap | null = null
  private _textState: TextState | null = null
  private _goldWindow!: Window_Gold
  private _choiceWindow!: Window_ChoiceList
  private _numberWindow!: Window_NumberInput
  private _itemWindow!: Window_EventItem
  private _showFast = false
  private _lineShowFast = false
  private _pauseSkip = false

  override initialize() {
    const width = this.windowWidth()
    const height = this.windowHeight()
    const x = (Graphics.boxWidth - width) / 2
    super.initialize(x, 0, width, height)
    this.openness = 0
    this.createSubWindows()
    this.updatePlacement()
    return this
  }

  subWindows() {
    return [this._goldWindow, this._choiceWindow,
      this._numberWindow, this._itemWindow]
  }

  createSubWindows() {
    this._goldWindow = new Window_Gold().initialize(0, 0)
    this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width
    this._goldWindow.openness = 0
    this._choiceWindow = new Window_ChoiceList(this).initialize()
    this._numberWindow = new Window_NumberInput(this).initialize()
    this._itemWindow = new Window_EventItem(this).initialize()
  }

  windowWidth() {
    return Graphics.boxWidth
  }

  windowHeight() {
    return this.fittingHeight(this.numVisibleRows())
  }

  clearFlags() {
    this._showFast = false
    this._lineShowFast = false
    this._pauseSkip = false
  }

  numVisibleRows() {
    return 4
  }

  override update() {
    this.checkToNotClose()
    super.update()
    while (!this.isOpening() && !this.isClosing()) {
      if (this.updateWait()) {
        return
      } else if (this.updateLoading()) {
        return
      } else if (this.updateInput()) {
        return
      } else if (this.updateMessage()) {
        return
      } else if (this.canStart()) {
        this.startMessage()
      } else {
        this.startInput()
        return
      }
    }
  }

  checkToNotClose() {
    if (this.isClosing() && this.isOpen()) {
      if (this.doesContinue()) {
        this.open()
      }
    }
  }

  canStart() {
    return global.$gameMessage.hasText() && !global.$gameMessage.scrollMode()
  }

  startMessage() {
    this._textState = {height: 0, index: 0, left: 0, text: this.convertEscapeCharacters(global.$gameMessage.allText()), x: 0, y: 0}
    this.newPage(this._textState)
    this.updatePlacement()
    this.updateBackground()
    this.open()
  }

  updatePlacement() {
    this._positionType = global.$gameMessage.positionType()
    this.y = this._positionType * (Graphics.boxHeight - this.height) / 2
    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height
  }

  updateBackground() {
    this._background = global.$gameMessage.background()
    this.setBackgroundType(this._background)
  }

  terminateMessage() {
    this.close()
    this._goldWindow.close()
    global.$gameMessage.clear()
  }

  updateWait() {
    if (this._waitCount > 0) {
      this._waitCount--
      return true
    } else {
      return false
    }
  }

  updateLoading() {
    if (this._faceBitmap) {
      if (this._faceBitmap.isReady()) {
        this.drawMessageFace()
        this._faceBitmap = null
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  updateInput() {
    if (this.isAnySubWindowActive()) {
      return true
    }
    if (this.pause) {
      if (this.isTriggered()) {
        Input.update()
        this.pause = false
        if (!this._textState) {
          this.terminateMessage()
        }
      }
      return true
    }
    return false
  }

  isAnySubWindowActive() {
    return (this._choiceWindow.active ||
      this._numberWindow.active ||
      this._itemWindow.active)
  }

  updateMessage() {
    if (this._textState) {
      while (!this.isEndOfText(this._textState)) {
        if (this.needsNewPage(this._textState)) {
          this.newPage(this._textState)
        }
        this.updateShowFast()
        this.processCharacter(this._textState)
        if (!this._showFast && !this._lineShowFast) {
          break
        }
        if (this.pause || this._waitCount > 0) {
          break
        }
      }
      if (this.isEndOfText(this._textState)) {
        this.onEndOfText()
      }
      return true
    } else {
      return false
    }
  }

  onEndOfText() {
    if (!this.startInput()) {
      if (!this._pauseSkip) {
        this.startPause()
      } else {
        this.terminateMessage()
      }
    }
    this._textState = null
  }

  startInput() {
    if (global.$gameMessage.isChoice()) {
      this._choiceWindow.start()
      return true
    } else if (global.$gameMessage.isNumberInput()) {
      this._numberWindow.start()
      return true
    } else if (global.$gameMessage.isItemChoice()) {
      this._itemWindow.start()
      return true
    } else {
      return false
    }
  }

  isTriggered() {
    return (Input.isRepeated('ok') || Input.isRepeated('cancel') ||
      TouchInput.isRepeated())
  }

  doesContinue() {
    return (global.$gameMessage.hasText() && !global.$gameMessage.scrollMode() &&
      !this.areSettingsChanged())
  }

  areSettingsChanged() {
    return (this._background !== global.$gameMessage.background() ||
      this._positionType !== global.$gameMessage.positionType())
  }

  updateShowFast() {
    if (this.isTriggered()) {
      this._showFast = true
    }
  }

  newPage(textState: TextState) {
    this.contents.clear()
    this.resetFontSettings()
    this.clearFlags()
    this.loadMessageFace()
    textState.x = this.newLineX()
    textState.y = 0
    textState.left = this.newLineX()
    textState.height = this.calcTextHeight(textState, false)
  }

  loadMessageFace() {
    this._faceBitmap = ImageManager.reserveFace(global.$gameMessage.faceName(), 0, this._imageReservationId)
  }

  drawMessageFace() {
    this.drawFace(global.$gameMessage.faceName(), global.$gameMessage.faceIndex(), 0, 0)
    ImageManager.releaseReservation(this._imageReservationId)
  }

  newLineX() {
    return global.$gameMessage.faceName() === '' ? 0 : 168
  }

  override processNewLine(textState: TextState) {
    this._lineShowFast = false
    super.processNewLine(textState)
    if (this.needsNewPage(textState)) {
      this.startPause()
    }
  }

  override processNewPage(textState: TextState) {
    super.processNewPage(textState)
    if (textState.text[textState.index] === '\n') {
      textState.index++
    }
    textState.y = this.contents.height
    this.startPause()
  }

  isEndOfText(textState: TextState) {
    return textState.index >= textState.text.length
  }

  needsNewPage(textState: TextState) {
    return (!this.isEndOfText(textState) &&
      textState.y + textState.height > this.contents.height)
  }

  override processEscapeCharacter(code: string, textState: TextState) {
    switch (code) {
    case '$':
      this._goldWindow.open()
      break
    case '.':
      this.startWait(15)
      break
    case '|':
      this.startWait(60)
      break
    case '!':
      this.startPause()
      break
    case '>':
      this._lineShowFast = true
      break
    case '<':
      this._lineShowFast = false
      break
    case '^':
      this._pauseSkip = true
      break
    default:
      super.processEscapeCharacter(code, textState)
      break
    }
  }

  startWait(count: number) {
    this._waitCount = count
  }

  startPause() {
    this.startWait(10)
    this.pause = true
  }
}
