import {Window_Selectable} from './Window_Selectable'
import {global} from '../managers/DataManager'
import {Data_Armor, Data_Item, Data_Weapon} from '../types/global'
import {Window_ShopStatus} from './Window_ShopStatus'

// Window_ShopBuy
//
// The window for selecting an item to buy on the shop screen.
export class Window_ShopBuy extends Window_Selectable {

  private readonly _shopGoods: number[][]
  private _money = 0
  private _data: (Data_Armor | Data_Weapon | Data_Item)[] = []
  private _price: number[] = []
  private _statusWindow: Window_ShopStatus | null = null

  constructor(shopGoods: number[][]) {
    super()
    this._shopGoods = shopGoods
  }

  override initialize(x: number, y: number, height: number) {
    const width = this.windowWidth()
    super.initialize(x, y, width, height)
    this.refresh()
    this.select(0)
    return this
  }

  windowWidth() {
    return 456
  }

  override maxItems() {
    return this._data ? this._data.length : 1
  }

  item() {
    return this._data[this.index()]
  }

  setMoney(money: number) {
    this._money = money
    this.refresh()
  }

  override isCurrentItemEnabled() {
    return this.isEnabled(this._data[this.index()])
  }

  price(item: Data_Armor | Data_Weapon | Data_Item | null) {
    return item && this._price[this._data.indexOf(item)] || 0
  }

  isEnabled(item: Data_Armor | Data_Weapon | Data_Item | null) {
    return !!(item && this.price(item) <= this._money && !global.$gameParty.hasMaxItems(item))
  }

  override refresh() {
    this.makeItemList()
    this.createContents()
    this.drawAllItems()
  }

  makeItemList() {
    this._data = []
    this._price = []
    this._shopGoods.forEach((goods) => {
      let item: Data_Armor | Data_Weapon | Data_Item | null = null
      switch (goods[0]) {
      case 0:
        item = global.$dataItems[goods[1]]
        break
      case 1:
        item = global.$dataWeapons[goods[1]]
        break
      case 2:
        item = global.$dataArmors[goods[1]]
        break
      }
      if (item) {
        this._data.push(item)
        this._price.push(goods[2] === 0 ? item.price : goods[3])
      }
    })
  }

  override drawItem(index: number) {
    const item = this._data[index]
    const rect = this.itemRect(index)
    const priceWidth = 96
    rect.width -= this.textPadding()
    this.changePaintOpacity(this.isEnabled(item))
    this.drawItemName(item, rect.x, rect.y, rect.width - priceWidth)
    this.drawText(this.price(item).toString(), rect.x + rect.width - priceWidth,
      rect.y, priceWidth, 'right')
    this.changePaintOpacity(true)
  }

  setStatusWindow(statusWindow: Window_ShopStatus) {
    this._statusWindow = statusWindow
    this.callUpdateHelp()
  }

  override updateHelp() {
    this.setHelpWindowItem(this.item())
    if (this._statusWindow) {
      this._statusWindow.setItem(this.item())
    }
  }
}
