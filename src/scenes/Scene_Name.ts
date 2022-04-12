import {Scene_MenuBase} from './Scene_MenuBase'
import {global} from '../managers/DataManager'
import {Window_NameEdit} from '../windows/Window_NameEdit'
import {Window_NameInput} from '../windows/Window_NameInput'

// Scene_Name
//
// The scene class of the name input screen.
export class Scene_Name extends Scene_MenuBase {

  private _actorId
  private _maxLength
  private _editWindow
  private _inputWindow

  prepare(actorId, maxLength) {
    this._actorId = actorId
    this._maxLength = maxLength
  }

  override create() {
    super.create()
    this._actor = global.$gameActors.actor(this._actorId)
    this.createEditWindow()
    this.createInputWindow()
  }

  override start() {
    super.start()
    this._editWindow.refresh()
  }

  createEditWindow() {
    this._editWindow = new Window_NameEdit(this._actor, this._maxLength)
    this.addWindow(this._editWindow)
  }

  createInputWindow() {
    this._inputWindow = new Window_NameInput(this._editWindow)
    this._inputWindow.setHandler('ok', this.onInputOk.bind(this))
    this.addWindow(this._inputWindow)
  }

  onInputOk() {
    this._actor.setName(this._editWindow.name())
    this.popScene()
  }
}
