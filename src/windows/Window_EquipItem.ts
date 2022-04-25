import {Window_ItemList} from './Window_ItemList'
import {JsonEx} from '../core/JsonEx'
import {Game_Actor} from '../objects/Game_Actor'
import {Data_Armor, Data_Item, Data_ItemBase, Data_Weapon} from '../types/global'
import {Window_EquipStatus} from './Window_EquipStatus'
import {assert} from '../utils'

// Window_EquipItem
//
// The window for selecting an equipment item on the equipment screen.
export class Window_EquipItem extends Window_ItemList {

  private _actor: Game_Actor | null = null
  private _slotId = 0
  private _statusWindow: Window_EquipStatus | null = null

  setActor(actor: Game_Actor) {
    if (this._actor !== actor) {
      this._actor = actor
      this.refresh()
      this.resetScroll()
    }
  }

  setSlotId(slotId: number) {
    if (this._slotId !== slotId) {
      this._slotId = slotId
      this.refresh()
      this.resetScroll()
    }
  }

  override includes(item: Data_Item | Data_Weapon | Data_Armor | null) {
    if (item === null) {
      return true
    }
    assert(this._actor !== null)
    if (this._slotId < 0 || (item as Data_Weapon | Data_Armor).etypeId !== this._actor.equipSlots()[this._slotId]) {
      return false
    }
    return this._actor.canEquip(item)
  }

  override isEnabled(item: Data_ItemBase | null) {
    return true
  }

  override selectLast() {
    // empty
  }

  setStatusWindow(statusWindow: Window_EquipStatus) {
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
