import {Scene_MenuBase} from './Scene_MenuBase'
import {ConfigManager} from '../managers/ConfigManager'

// Scene_Options
//
// The scene class of the options screen.
export class Scene_Options extends Scene_MenuBase {

  private _optionsWindow

  override create() {
    super.create()
    this.createOptionsWindow()
  }

  override terminate() {
    super.terminate()
    ConfigManager.save()
  }

  createOptionsWindow() {
    this._optionsWindow = new Window_Options()
    this._optionsWindow.setHandler('cancel', this.popScene.bind(this))
    this.addWindow(this._optionsWindow)
  }
}
