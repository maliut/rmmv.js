import {Window_ItemList} from './Window_ItemList'
import {global} from '../managers/DataManager'

// Window_BattleItem
//
// The window for selecting an item to use on the battle screen.
export class Window_BattleItem extends Window_ItemList {

  constructor(x, y, width, height) {
    super(x, y, width, height)
    this.hide()
  }

  override includes(item) {
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
