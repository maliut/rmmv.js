import {Window_Selectable} from './Window_Selectable'
import {global} from '../managers/DataManager'

// Window_EquipSlot
//
// The window for selecting an equipment slot on the equipment screen.
export class Window_EquipSlot extends Window_Selectable {

  private _actor = null
  private _itemWindow
  private _statusWindow

  override initialize(x, y, width, height) {
    super.initialize(x, y, width, height)
    this.refresh()
  }

  setActor(actor) {
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
    return this._actor ? this._actor.equipSlots().length : 0
  }

  item() {
    return this._actor ? this._actor.equips()[this.index()] : null
  }

  override drawItem(index) {
    if (this._actor) {
      const rect = this.itemRectForText(index)
      this.changeTextColor(this.systemColor())
      this.changePaintOpacity(this.isEnabled(index))
      this.drawText(this.slotName(index), rect.x, rect.y, 138, this.lineHeight())
      this.drawItemName(this._actor.equips()[index], rect.x + 138, rect.y)
      this.changePaintOpacity(true)
    }
  }

  slotName(index) {
    const slots = this._actor.equipSlots()
    return this._actor ? global.$dataSystem.equipTypes[slots[index]] : ''
  }

  isEnabled(index) {
    return this._actor ? this._actor.isEquipChangeOk(index) : false
  }

  override isCurrentItemEnabled() {
    return this.isEnabled(this.index())
  }

  setStatusWindow(statusWindow) {
    this._statusWindow = statusWindow
    this.callUpdateHelp()
  }

  setItemWindow(itemWindow) {
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
