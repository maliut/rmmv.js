import {Window_HorzCommand} from './Window_HorzCommand'
import {Graphics} from '../core/Graphics'
import {TextManager} from '../managers/TextManager'
import {Window_ItemList} from './Window_ItemList'

// Window_ItemCategory
//
// The window for selecting a category of items on the item and shop screens.
export class Window_ItemCategory extends Window_HorzCommand {

  private _itemWindow: Window_ItemList | null = null

  override initialize() {
    super.initialize(0, 0)
    return this
  }

  override windowWidth() {
    return Graphics.boxWidth
  }

  override maxCols() {
    return 4
  }

  override update() {
    super.update()
    if (this._itemWindow) {
      this._itemWindow.setCategory(this.currentSymbol())
    }
  }

  override makeCommandList() {
    this.addCommand(TextManager.item, 'item')
    this.addCommand(TextManager.weapon, 'weapon')
    this.addCommand(TextManager.armor, 'armor')
    this.addCommand(TextManager.keyItem, 'keyItem')
  }

  setItemWindow(itemWindow: Window_ItemList) {
    this._itemWindow = itemWindow
  }
}
