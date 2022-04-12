import {Window_ItemList} from './Window_ItemList'
import {JsonEx} from '../core/JsonEx'

// Window_EquipItem
//
// The window for selecting an equipment item on the equipment screen.
export class Window_EquipItem extends Window_ItemList {

  private _actor = null
  private _slotId = 0
  private _statusWindow

  setActor(actor) {
    if (this._actor !== actor) {
      this._actor = actor
      this.refresh()
      this.resetScroll()
    }
  }

  setSlotId(slotId) {
    if (this._slotId !== slotId) {
      this._slotId = slotId
      this.refresh()
      this.resetScroll()
    }
  }

  override includes(item) {
    if (item === null) {
      return true
    }
    if (this._slotId < 0 || item.etypeId !== this._actor.equipSlots()[this._slotId]) {
      return false
    }
    return this._actor.canEquip(item)
  }

  override isEnabled(item) {
    return true
  }

  override selectLast() {
    // empty
  }

  setStatusWindow(statusWindow) {
    this._statusWindow = statusWindow
    this.callUpdateHelp()
  }

  override updateHelp() {
    super.updateHelp()
    if (this._actor && this._statusWindow) {
      const actor = JsonEx.makeDeepCopy(this._actor)
      actor.forceChangeEquip(this._slotId, this.item())
      this._statusWindow.setTempActor(actor)
    }
  }

  override playOkSound() {
    // empty
  }
}
