import {Scene_Base} from './Scene_Base'
import {Sprite} from '../core/Sprite'
import {SceneManager} from '../managers/SceneManager'
import {global} from '../managers/DataManager'
import {Window_Help} from '../windows/Window_Help'

// Scene_MenuBase
//
// The superclass of all the menu-type scenes.
export abstract class Scene_MenuBase extends Scene_Base {

  protected _actor
  private _backgroundSprite: Sprite | null = null
  protected _helpWindow

  override create() {
    super.create()
    this.createBackground()
    this.updateActor()
    this.createWindowLayer()
  }

  actor() {
    return this._actor
  }

  updateActor() {
    this._actor = global.$gameParty.menuActor()
  }

  createBackground() {
    this._backgroundSprite = new Sprite()
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap()
    this.addChild(this._backgroundSprite)
  }

  setBackgroundOpacity(opacity) {
    this._backgroundSprite.opacity = opacity
  }

  createHelpWindow() {
    this._helpWindow = new Window_Help().initialize()
    this.addWindow(this._helpWindow)
  }

  nextActor() {
    global.$gameParty.makeMenuActorNext()
    this.updateActor()
    this.onActorChange()
  }

  previousActor() {
    global.$gameParty.makeMenuActorPrevious()
    this.updateActor()
    this.onActorChange()
  }

  onActorChange() {
    // empty
  }
}
