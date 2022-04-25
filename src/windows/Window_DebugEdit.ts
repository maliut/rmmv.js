import {Window_Selectable} from './Window_Selectable'
import {SoundManager} from '../managers/SoundManager'
import {Input} from '../core/Input'
import {global} from '../managers/DataManager'

// Window_DebugEdit
//
// The window for displaying switches and variables on the debug screen.
export class Window_DebugEdit extends Window_Selectable {

  private _mode = 'switch'
  private _topId = 1

  override initialize(x: number, y: number, width: number) {
    const height = this.fittingHeight(10)
    super.initialize(x, y, width, height)
    this.refresh()
    return this
  }

  override maxItems() {
    return 10
  }

  override refresh() {
    this.contents.clear()
    this.drawAllItems()
  }

  override drawItem(index: number) {
    const dataId = this._topId + index
    const idText = dataId.padZero(4) + ':'
    const idWidth = this.textWidth(idText)
    const statusWidth = this.textWidth('-00000000')
    const name = this.itemName(dataId)
    const status = this.itemStatus(dataId)
    const rect = this.itemRectForText(index)
    this.resetTextColor()
    this.drawText(idText, rect.x, rect.y, rect.width)
    rect.x += idWidth
    rect.width -= idWidth + statusWidth
    this.drawText(name, rect.x, rect.y, rect.width)
    this.drawText(status, rect.x + rect.width, rect.y, statusWidth, 'right')
  }

  itemName(dataId: number) {
    if (this._mode === 'switch') {
      return global.$dataSystem.switches[dataId]
    } else {
      return global.$dataSystem.variables[dataId]
    }
  }

  itemStatus(dataId: number) {
    if (this._mode === 'switch') {
      return global.$gameSwitches.value(dataId) ? '[ON]' : '[OFF]'
    } else {
      return String(global.$gameVariables.value(dataId))
    }
  }

  setMode(mode: string) {
    if (this._mode !== mode) {
      this._mode = mode
      this.refresh()
    }
  }

  setTopId(id: number) {
    if (this._topId !== id) {
      this._topId = id
      this.refresh()
    }
  }

  currentId() {
    return this._topId + this.index()
  }

  override update() {
    super.update()
    if (this.active) {
      if (this._mode === 'switch') {
        this.updateSwitch()
      } else {
        this.updateVariable()
      }
    }
  }

  updateSwitch() {
    if (Input.isRepeated('ok')) {
      const switchId = this.currentId()
      SoundManager.playCursor()
      global.$gameSwitches.setValue(switchId, !global.$gameSwitches.value(switchId))
      this.redrawCurrentItem()
    }
  }

  updateVariable() {
    const variableId = this.currentId()
    let value = global.$gameVariables.value(variableId)
    if (typeof value === 'number') {
      if (Input.isRepeated('right')) {
        value++
      }
      if (Input.isRepeated('left')) {
        value--
      }
      if (Input.isRepeated('pagedown')) {
        value += 10
      }
      if (Input.isRepeated('pageup')) {
        value -= 10
      }
      if (global.$gameVariables.value(variableId) !== value) {
        global.$gameVariables.setValue(variableId, value)
        SoundManager.playCursor()
        this.redrawCurrentItem()
      }
    }
  }
}
