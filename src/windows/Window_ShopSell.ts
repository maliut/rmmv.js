import {Data_Armor, Data_Item, Data_Weapon} from '../types/global'
import {Window_ItemList} from './Window_ItemList'

// Window_ShopSell
//
// The window for selecting an item to sell on the shop screen.
export class Window_ShopSell extends Window_ItemList {

  override isEnabled(item: Data_Armor | Data_Weapon | Data_Item | null) {
    return !!item && item.price > 0
  }
}
