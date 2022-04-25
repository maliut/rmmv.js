import {Window_ItemList} from './Window_ItemList'
import {global} from '../managers/DataManager'
import {Data_ItemBase} from '../types/global'

// Window_BattleItem
//
// The window for selecting an item to use on the battle screen.
export class Window_BattleItem extends Window_ItemList {

  override initialize(x: number, y: number, width: number, height: number) {
    super.initialize(x, y, width, height)
    this.hide()
    return this
  }

  override includes(item: Data_ItemBase | null) {
    return global.$gameParty.canUse(item)
  }

  override show() {
    this.selectLast()
    this.showHelpWindow()
    super.show()
  }

  override hide() {
    this.hideHelpWindow()
    super.hide()
  }
}
