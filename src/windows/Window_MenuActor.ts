import {Window_MenuStatus} from './Window_MenuStatus'
import {Game_Action} from '../objects/Game_Action'
import {DataManager} from '../managers/DataManager'
import {global} from '../managers/DataManager'
import {Data_ItemBase} from '../types/global'

// Window_MenuActor
//
// The window for selecting a target actor on the item and skill screens.
export class Window_MenuActor extends Window_MenuStatus {

  override initialize() {
    super.initialize(0, 0)
    this.hide()
    return this
  }

  override processOk() {
    if (!this.cursorAll()) {
      global.$gameParty.setTargetActor(global.$gameParty.members()[this.index()])
    }
    this.callOkHandler()
  }

  override selectLast() {
    this.select(global.$gameParty.targetActor().index() || 0)
  }

  selectForItem(item: Data_ItemBase | null) {
    const actor = global.$gameParty.menuActor()
    const action = new Game_Action(actor)
    action.setItemObject(item)
    this.setCursorFixed(false)
    this.setCursorAll(false)
    if (action.isForUser()) {
      if (DataManager.isSkill(item)) {
        this.setCursorFixed(true)
        this.select(actor.index())
      } else {
        this.selectLast()
      }
    } else if (action.isForAll()) {
      this.setCursorAll(true)
      this.select(0)
    } else {
      this.selectLast()
    }
  }
}
