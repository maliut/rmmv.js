import {Scene_MenuBase} from './Scene_MenuBase'
import {global} from '../managers/DataManager'
import {SceneManager} from '../managers/SceneManager'
import {Graphics} from '../core/Graphics'
import {Scene_Item} from './Scene_Item'
import {Scene_Options} from './Scene_Options'
import {Scene_Save} from './Scene_Save'
import {Scene_GameEnd} from './Scene_GameEnd'
import {Scene_Skill} from './Scene_Skill'
import {Scene_Equip} from './Scene_Equip'
import {Scene_Status} from './Scene_Status'
import {Window_MenuCommand} from '../windows/Window_MenuCommand'
import {Window_Gold} from '../windows/Window_Gold'
import {Window_MenuStatus} from '../windows/Window_MenuStatus'

// Scene_Menu
//
// The scene class of the menu screen.
export class Scene_Menu extends Scene_MenuBase {

  private _statusWindow!: Window_MenuStatus
  private _commandWindow!: Window_MenuCommand
  private _goldWindow!: Window_Gold

  override create() {
    super.create()
    this.createCommandWindow()
    this.createGoldWindow()
    this.createStatusWindow()
  }

  override start() {
    super.start()
    this._statusWindow.refresh()
  }

  createCommandWindow() {
    this._commandWindow = new Window_MenuCommand().initialize(0, 0)
    this._commandWindow.setHandler('item', this.commandItem.bind(this))
    this._commandWindow.setHandler('skill', this.commandPersonal.bind(this))
    this._commandWindow.setHandler('equip', this.commandPersonal.bind(this))
    this._commandWindow.setHandler('status', this.commandPersonal.bind(this))
    this._commandWindow.setHandler('formation', this.commandFormation.bind(this))
    this._commandWindow.setHandler('options', this.commandOptions.bind(this))
    this._commandWindow.setHandler('save', this.commandSave.bind(this))
    this._commandWindow.setHandler('gameEnd', this.commandGameEnd.bind(this))
    this._commandWindow.setHandler('cancel', this.popScene.bind(this))
    this.addWindow(this._commandWindow)
  }

  createGoldWindow() {
    this._goldWindow = new Window_Gold().initialize(0, 0)
    this._goldWindow.y = Graphics.boxHeight - this._goldWindow.height
    this.addWindow(this._goldWindow)
  }

  createStatusWindow() {
    this._statusWindow = new Window_MenuStatus().initialize(this._commandWindow.width, 0)
    this._statusWindow.reserveFaceImages()
    this.addWindow(this._statusWindow)
  }

  commandItem() {
    SceneManager.push(Scene_Item)
  }

  commandPersonal() {
    this._statusWindow.setFormationMode(false)
    this._statusWindow.selectLast()
    this._statusWindow.activate()
    this._statusWindow.setHandler('ok', this.onPersonalOk.bind(this))
    this._statusWindow.setHandler('cancel', this.onPersonalCancel.bind(this))
  }

  commandFormation() {
    this._statusWindow.setFormationMode(true)
    this._statusWindow.selectLast()
    this._statusWindow.activate()
    this._statusWindow.setHandler('ok', this.onFormationOk.bind(this))
    this._statusWindow.setHandler('cancel', this.onFormationCancel.bind(this))
  }

  commandOptions() {
    SceneManager.push(Scene_Options)
  }

  commandSave() {
    SceneManager.push(Scene_Save)
  }

  commandGameEnd() {
    SceneManager.push(Scene_GameEnd)
  }

  onPersonalOk() {
    switch (this._commandWindow.currentSymbol()) {
    case 'skill':
      SceneManager.push(Scene_Skill)
      break
    case 'equip':
      SceneManager.push(Scene_Equip)
      break
    case 'status':
      SceneManager.push(Scene_Status)
      break
    }
  }

  onPersonalCancel() {
    this._statusWindow.deselect()
    this._commandWindow.activate()
  }

  onFormationOk() {
    const index = this._statusWindow.index()
    const actor = global.$gameParty.members()[index]
    const pendingIndex = this._statusWindow.pendingIndex()
    if (pendingIndex >= 0) {
      global.$gameParty.swapOrder(index, pendingIndex)
      this._statusWindow.setPendingIndex(-1)
      this._statusWindow.redrawItem(index)
    } else {
      this._statusWindow.setPendingIndex(index)
    }
    this._statusWindow.activate()
  }

  onFormationCancel() {
    if (this._statusWindow.pendingIndex() >= 0) {
      this._statusWindow.setPendingIndex(-1)
      this._statusWindow.activate()
    } else {
      this._statusWindow.deselect()
      this._commandWindow.activate()
    }
  }
}
