import {Window_Selectable} from './Window_Selectable'
import {global} from '../managers/DataManager'
import {Input} from '../core/Input'
import {Graphics} from '../core/Graphics'
import {Window_DebugEdit} from './Window_DebugEdit'

// Window_DebugRange
//
// The window for selecting a block of switches/variables on the debug screen.
export class Window_DebugRange extends Window_Selectable {

  static lastTopRow = 0
  static lastIndex = 0

  private _maxSwitches = 0
  private _maxVariables = 0
  private _editWindow: Window_DebugEdit | null = null

  override initialize(x: number, y: number) {
    this._maxSwitches = Math.ceil((global.$dataSystem.switches.length - 1) / 10)
    this._maxVariables = Math.ceil((global.$dataSystem.variables.length - 1) / 10)
    const width = this.windowWidth()
    const height = this.windowHeight()
    super.initialize(x, y, width, height)
    this.refresh()
    this.setTopRow(Window_DebugRange.lastTopRow)
    this.select(Window_DebugRange.lastIndex)
    this.activate()
    return this
  }

  windowWidth() {
    return 246
  }

  windowHeight() {
    return Graphics.boxHeight
  }

  override maxItems() {
    return this._maxSwitches + this._maxVariables
  }

  override update() {
    super.update()
    if (this._editWindow) {
      this._editWindow.setMode(this.mode())
      this._editWindow.setTopId(this.topId())
    }
  }

  mode() {
    return this.index() < this._maxSwitches ? 'switch' : 'variable'
  }

  topId() {
    const index = this.index()
    if (index < this._maxSwitches) {
      return index * 10 + 1
    } else {
      return (index - this._maxSwitches) * 10 + 1
    }
  }

  override refresh() {
    this.createContents()
    this.drawAllItems()
  }

  override drawItem(index: number) {
    const rect = this.itemRectForText(index)
    let start
    let text
    if (index < this._maxSwitches) {
      start = index * 10 + 1
      text = 'S'
    } else {
      start = (index - this._maxSwitches) * 10 + 1
      text = 'V'
    }
    const end = start + 9
    text += ' [' + start.padZero(4) + '-' + end.padZero(4) + ']'
    this.drawText(text, rect.x, rect.y, rect.width)
  }

  override isCancelTriggered() {
    return super.isCancelTriggered() || Input.isTriggered('debug')
  }

  override processCancel() {
    super.processCancel()
    Window_DebugRange.lastTopRow = this.topRow()
    Window_DebugRange.lastIndex = this.index()
  }

  setEditWindow(editWindow: Window_DebugEdit) {
    this._editWindow = editWindow
  }
}
