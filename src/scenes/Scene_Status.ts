import {Scene_MenuBase} from './Scene_MenuBase'
import {Window_Status} from '../windows/Window_Status'

// Scene_Status
//
// The scene class of the status screen.
export class Scene_Status extends Scene_MenuBase {

  private _statusWindow!: Window_Status

  override create() {
    super.create()
    this._statusWindow = new Window_Status().initialize()
    this._statusWindow.setHandler('cancel', this.popScene.bind(this))
    this._statusWindow.setHandler('pagedown', this.nextActor.bind(this))
    this._statusWindow.setHandler('pageup', this.previousActor.bind(this))
    this._statusWindow.reserveFaceImages()
    this.addWindow(this._statusWindow)
  }

  override start() {
    super.start()
    this.refreshActor()
  }

  refreshActor() {
    const actor = this.actor()
    this._statusWindow.setActor(actor)
  }

  override onActorChange() {
    this.refreshActor()
    this._statusWindow.activate()
  }
}
