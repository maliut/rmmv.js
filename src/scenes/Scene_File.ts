import {Scene_MenuBase} from './Scene_MenuBase'
import {Graphics} from '../core/Graphics'
import {DataManager} from '../managers/DataManager'
import {Window_Help} from '../windows/Window_Help'
import {Window_SavefileList} from '../windows/Window_SavefileList'

// Scene_File
//
// The superclass of Scene_Save and Scene_Load.
export abstract class Scene_File extends Scene_MenuBase {

  private _listWindow!: Window_SavefileList

  override create() {
    super.create()
    DataManager.loadAllSavefileImages()
    this.createHelpWindow()
    this.createListWindow()
  }

  override start() {
    super.start()
    this._listWindow.refresh()
  }

  savefileId() {
    return this._listWindow.index() + 1
  }

  override createHelpWindow() {
    this._helpWindow = new Window_Help().initialize(1)
    this._helpWindow.setText(this.helpWindowText())
    this.addWindow(this._helpWindow)
  }

  createListWindow() {
    const x = 0
    const y = this._helpWindow.height
    const width = Graphics.boxWidth
    const height = Graphics.boxHeight - y
    this._listWindow = new Window_SavefileList().initialize(x, y, width, height)
    this._listWindow.setHandler('ok', this.onSavefileOk.bind(this))
    this._listWindow.setHandler('cancel', this.popScene.bind(this))
    this._listWindow.select(this.firstSavefileIndex())
    this._listWindow.setTopRow(this.firstSavefileIndex() - 2)
    this._listWindow.setMode(this.mode())
    this._listWindow.refresh()
    this.addWindow(this._listWindow)
  }

  abstract mode(): string

  activateListWindow() {
    this._listWindow.activate()
  }

  abstract helpWindowText(): string

  abstract firstSavefileIndex(): number

  abstract onSavefileOk()
}
