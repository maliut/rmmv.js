import {Scene_MenuBase} from './Scene_MenuBase'
import {SceneManager} from '../managers/SceneManager'
import {Scene_Title} from './Scene_Title'
import {Window_GameEnd} from '../windows/Window_GameEnd'

// Scene_GameEnd
//
// The scene class of the game end screen.
export class Scene_GameEnd extends Scene_MenuBase {

  private _commandWindow

  override create() {
    super.create()
    this.createCommandWindow()
  }

  override stop() {
    super.stop()
    this._commandWindow.close()
  }

  override createBackground() {
    super.createBackground()
    this.setBackgroundOpacity(128)
  }

  createCommandWindow() {
    this._commandWindow = new Window_GameEnd().initialize()
    this._commandWindow.setHandler('toTitle',  this.commandToTitle.bind(this))
    this._commandWindow.setHandler('cancel',   this.popScene.bind(this))
    this.addWindow(this._commandWindow)
  }

  commandToTitle() {
    this.fadeOutAll()
    SceneManager.goto(Scene_Title)
  }
}
