import {Scene_ItemBase} from './Scene_ItemBase'
import {global} from '../managers/DataManager'
import {Graphics} from '../core/Graphics'
import {SoundManager} from '../managers/SoundManager'
import {Window_ItemList} from '../windows/Window_ItemList'
import {Window_ItemCategory} from '../windows/Window_ItemCategory'

// Scene_Item
//
// The scene class of the item screen.
export class Scene_Item extends Scene_ItemBase {

  private _categoryWindow!: Window_ItemCategory
  protected override _itemWindow!: Window_ItemList

  override create() {
    super.create()
    this.createHelpWindow()
    this.createCategoryWindow()
    this.createItemWindow()
    this.createActorWindow()
  }

  createCategoryWindow() {
    this._categoryWindow = new Window_ItemCategory().initialize()
    this._categoryWindow.setHelpWindow(this._helpWindow)
    this._categoryWindow.y = this._helpWindow.height
    this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this))
    this._categoryWindow.setHandler('cancel', this.popScene.bind(this))
    this.addWindow(this._categoryWindow)
  }

  createItemWindow() {
    const wy = this._categoryWindow.y + this._categoryWindow.height
    const wh = Graphics.boxHeight - wy
    this._itemWindow = new Window_ItemList().initialize(0, wy, Graphics.boxWidth, wh)
    this._itemWindow.setHelpWindow(this._helpWindow)
    this._itemWindow.setHandler('ok', this.onItemOk.bind(this))
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this))
    this.addWindow(this._itemWindow)
    this._categoryWindow.setItemWindow(this._itemWindow)
  }

  override user() {
    const members = global.$gameParty.movableMembers()
    let bestActor = members[0]
    let bestPha = 0
    for (let i = 0; i < members.length; i++) {
      if (members[i].pha > bestPha) {
        bestPha = members[i].pha
        bestActor = members[i]
      }
    }
    return bestActor
  }

  onCategoryOk() {
    this._itemWindow.activate()
    this._itemWindow.selectLast()
  }

  onItemOk() {
    global.$gameParty.setLastItem(this.item())
    this.determineItem()
  }

  onItemCancel() {
    this._itemWindow.deselect()
    this._categoryWindow.activate()
  }

  override playSeForItem() {
    SoundManager.playUseItem()
  }

  override useItem() {
    super.useItem()
    this._itemWindow.redrawCurrentItem()
  }
}
