import {Window_Selectable} from './Window_Selectable'
import {global} from '../managers/DataManager'
import {Game_Actor} from '../objects/Game_Actor'
import {Window_EquipStatus} from './Window_EquipStatus'
import {Window_EquipItem} from './Window_EquipItem'

// Window_EquipSlot
//
// The window for selecting an equipment slot on the equipment screen.
export class Window_EquipSlot extends Window_Selectable {

  private _actor: Game_Actor | null = null
  private _itemWindow: Window_EquipItem | null = null
  private _statusWindow: Window_EquipStatus | null = null

  override initialize(x: number, y: number, width: number, height: number) {
    super.initialize(x, y, width, height)
    this.refresh()
    return this
  }

  setActor(actor: Game_Actor | null) {
    if (this._actor !== actor) {
      this._actor = actor
      this.refresh()
    }
  }

  override update() {
    super.update()
    if (this._itemWindow) {
      this._itemWindow.setSlotId(this.index())
    }
  }

  override maxItems() {
    return this._actor?.equipSlots().length || 0
  }

  item() {
    return this._actor?.equips()[this.index()] || null
  }

  override drawItem(index: number) {
    if (this._actor) {
      const rect = this.itemRectForText(index)
      this.changeTextColor(this.systemColor())
      this.changePaintOpacity(this.isEnabled(index))
      this.drawText(this.slotName(index), rect.x, rect.y, 138)
      this.drawItemName(this._actor.equips()[index], rect.x + 138, rect.y)
      this.changePaintOpacity(true)
    }
  }

  slotName(index: number) {
    return this._actor ? global.$dataSystem.equipTypes[this._actor.equipSlots()[index]] : ''
  }

  isEnabled(index: number) {
    return this._actor ? this._actor.isEquipChangeOk(index) : false
  }

  override isCurrentItemEnabled() {
    return this.isEnabled(this.index())
  }

  setStatusWindow(statusWindow: Window_EquipStatus) {
    this._statusWindow = statusWindow
    this.callUpdateHelp()
  }

  setItemWindow(itemWindow: Window_EquipItem) {
    this._itemWindow = itemWindow
  }

  override updateHelp() {
    super.updateHelp()
    this.setHelpWindowItem(this.item())
    if (this._statusWindow) {
      this._statusWindow.setTempActor(null)
    }
  }
}
