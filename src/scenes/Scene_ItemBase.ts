import {Scene_MenuBase} from './Scene_MenuBase'
import {global} from '../managers/DataManager'
import {Graphics} from '../core/Graphics'
import {Game_Action} from '../objects/Game_Action'
import {SoundManager} from '../managers/SoundManager'
import {SceneManager} from '../managers/SceneManager'
import {Scene_Map} from './Scene_Map'
import {Window_MenuActor} from '../windows/Window_MenuActor'
import {Game_Battler} from '../objects/Game_Battler'
import {Window_ItemList} from '../windows/Window_ItemList'
import {Window_SkillList} from '../windows/Window_SkillList'

// Scene_ItemBase
//
// The superclass of Scene_Item and Scene_Skill.
export abstract class Scene_ItemBase extends Scene_MenuBase {

  private _actorWindow!: Window_MenuActor
  protected abstract _itemWindow: Window_ItemList | Window_SkillList

  createActorWindow() {
    this._actorWindow = new Window_MenuActor().initialize()
    this._actorWindow.setHandler('ok', this.onActorOk.bind(this))
    this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this))
    this.addWindow(this._actorWindow)
  }

  item() {
    return this._itemWindow.item()
  }

  abstract user(): Game_Battler

  isCursorLeft() {
    return this._itemWindow.index() % 2 === 0
  }

  showSubWindow(window: Window_MenuActor) {
    window.x = this.isCursorLeft() ? Graphics.boxWidth - window.width : 0
    window.show()
    window.activate()
  }

  hideSubWindow(window: Window_MenuActor) {
    window.hide()
    window.deactivate()
    this.activateItemWindow()
  }

  onActorOk() {
    if (this.canUse()) {
      this.useItem()
    } else {
      SoundManager.playBuzzer()
    }
  }

  onActorCancel() {
    this.hideSubWindow(this._actorWindow)
  }

  determineItem() {
    const action = new Game_Action(this.user())
    const item = this.item()
    action.setItemObject(item)
    if (action.isForFriend()) {
      this.showSubWindow(this._actorWindow)
      this._actorWindow.selectForItem(this.item())
    } else {
      this.useItem()
      this.activateItemWindow()
    }
  }

  useItem() {
    this.playSeForItem()
    this.user().useItem(this.item())
    this.applyItem()
    this.checkCommonEvent()
    this.checkGameover()
    this._actorWindow.refresh()
  }

  activateItemWindow() {
    this._itemWindow.refresh()
    this._itemWindow.activate()
  }

  itemTargetActors() {
    const action = new Game_Action(this.user())
    action.setItemObject(this.item())
    if (!action.isForFriend()) {
      return []
    } else if (action.isForAll()) {
      return global.$gameParty.members()
    } else {
      return [global.$gameParty.members()[this._actorWindow.index()]]
    }
  }

  canUse() {
    return this.user().canUse(this.item()) && this.isItemEffectsValid()
  }

  isItemEffectsValid() {
    const action = new Game_Action(this.user())
    action.setItemObject(this.item())
    return this.itemTargetActors().some(function (target) {
      return action.testApply(target)
    }, this)
  }

  applyItem() {
    const action = new Game_Action(this.user())
    action.setItemObject(this.item())
    this.itemTargetActors().forEach(function (target) {
      for (let i = 0; i < action.numRepeats(); i++) {
        action.apply(target)
      }
    }, this)
    action.applyGlobal()
  }

  checkCommonEvent() {
    if (global.$gameTemp.isCommonEventReserved()) {
      SceneManager.goto(Scene_Map)
    }
  }

  abstract playSeForItem()
}
