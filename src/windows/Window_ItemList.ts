import {Window_Selectable} from './Window_Selectable'
import {DataManager} from '../managers/DataManager'
import {global} from '../managers/DataManager'
import {Data_Armor, Data_Item, Data_ItemBase, Data_Weapon} from '../types/global'

// Window_ItemList
//
// The window for selecting an item on the item screen.
export class Window_ItemList extends Window_Selectable {

  private _category: string | null = 'none'
  private _data: (Data_Item | Data_Weapon | Data_Armor | null)[] = []

  setCategory(category: string | null) {
    if (this._category !== category) {
      this._category = category
      this.refresh()
      this.resetScroll()
    }
  }

  override maxCols() {
    return 2
  }

  override spacing() {
    return 48
  }

  override maxItems() {
    return this._data ? this._data.length : 1
  }

  item() {
    const index = this.index()
    return this._data && index >= 0 ? this._data[index] : null
  }

  override isCurrentItemEnabled() {
    return this.isEnabled(this.item())
  }

  includes(item: Data_Item | Data_Weapon | Data_Armor | null) {
    switch (this._category) {
    case 'item':
      return DataManager.isItem(item) && (item as Data_Item).itypeId === 1
    case 'weapon':
      return DataManager.isWeapon(item)
    case 'armor':
      return DataManager.isArmor(item)
    case 'keyItem':
      return DataManager.isItem(item) && (item as Data_Item).itypeId === 2
    default:
      return false
    }
  }

  needsNumber() {
    return true
  }

  isEnabled(item: Data_ItemBase | null) {
    return global.$gameParty.canUse(item)
  }

  makeItemList() {
    this._data = global.$gameParty.allItems().filter((item) => this.includes(item))
    if (this.includes(null)) {
      this._data.push(null)
    }
  }

  selectLast() {
    const index = this._data.indexOf(global.$gameParty.lastItem() as Data_Item | Data_Weapon | Data_Armor | null)
    this.select(index >= 0 ? index : 0)
  }

  override drawItem(index: number) {
    const item = this._data[index]
    if (item) {
      const numberWidth = this.numberWidth()
      const rect = this.itemRect(index)
      rect.width -= this.textPadding()
      this.changePaintOpacity(this.isEnabled(item))
      this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth)
      this.drawItemNumber(item, rect.x, rect.y, rect.width)
      this.changePaintOpacity(true)
    }
  }

  numberWidth() {
    return this.textWidth('000')
  }

  drawItemNumber(item: Data_ItemBase | null, x: number, y: number, width: number) {
    if (this.needsNumber()) {
      this.drawText(':', x, y, width - this.textWidth('00'), 'right')
      this.drawText(global.$gameParty.numItems(item).toString(), x, y, width, 'right')
    }
  }

  override updateHelp() {
    this.setHelpWindowItem(this.item())
  }

  override refresh() {
    this.makeItemList()
    this.createContents()
    this.drawAllItems()
  }
}
