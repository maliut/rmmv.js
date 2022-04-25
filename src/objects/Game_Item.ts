import {DataManager} from '../managers/DataManager'
import {global} from '../managers/DataManager'
import {Data_ItemBase} from '../types/global'

// Game_Item
//
// The game object class for handling skills, items, weapons, and armor. It is
// required because save data should not include the database object itself.
export class Game_Item {

  private _dataClass = ''
  private _itemId = 0

  constructor(item?: Data_ItemBase) {
    if (item) {
      this.setObject(item)
    }
  }

  isSkill() {
    return this._dataClass === 'skill'
  }

  isItem() {
    return this._dataClass === 'item'
  }

  isUsableItem() {
    return this.isSkill() || this.isItem()
  }

  isWeapon() {
    return this._dataClass === 'weapon'
  }

  isArmor() {
    return this._dataClass === 'armor'
  }

  isEquipItem() {
    return this.isWeapon() || this.isArmor()
  }

  isNull() {
    return this._dataClass === ''
  }

  itemId() {
    return this._itemId
  }

  object(): Data_ItemBase | null {
    if (this.isSkill()) {
      return global.$dataSkills[this._itemId]
    } else if (this.isItem()) {
      return global.$dataItems[this._itemId]
    } else if (this.isWeapon()) {
      return global.$dataWeapons[this._itemId]
    } else if (this.isArmor()) {
      return global.$dataArmors[this._itemId]
    } else {
      return null
    }
  }

  setObject(item: Data_ItemBase | null) {
    if (DataManager.isSkill(item)) {
      this._dataClass = 'skill'
    } else if (DataManager.isItem(item)) {
      this._dataClass = 'item'
    } else if (DataManager.isWeapon(item)) {
      this._dataClass = 'weapon'
    } else if (DataManager.isArmor(item)) {
      this._dataClass = 'armor'
    } else {
      this._dataClass = ''
    }
    this._itemId = item ? item.id : 0
  }

  setEquip(isWeapon: boolean, itemId: number) {
    this._dataClass = isWeapon ? 'weapon' : 'armor'
    this._itemId = itemId
  }
}
