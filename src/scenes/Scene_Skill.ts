import {Scene_ItemBase} from './Scene_ItemBase'
import {SoundManager} from '../managers/SoundManager'
import {Graphics} from '../core/Graphics'
import {Window_SkillType} from '../windows/Window_SkillType'
import {Window_SkillList} from '../windows/Window_SkillList'
import {Window_SkillStatus} from '../windows/Window_SkillStatus'

// Scene_Skill
//
// The scene class of the skill screen.
export class Scene_Skill extends Scene_ItemBase {

  private _skillTypeWindow
  private _statusWindow

  override create() {
    super.create()
    this.createHelpWindow()
    this.createSkillTypeWindow()
    this.createStatusWindow()
    this.createItemWindow()
    this.createActorWindow()
  }

  override start() {
    super.start()
    this.refreshActor()
  }

  createSkillTypeWindow() {
    const wy = this._helpWindow.height
    this._skillTypeWindow = new Window_SkillType(0, wy)
    this._skillTypeWindow.setHelpWindow(this._helpWindow)
    this._skillTypeWindow.setHandler('skill', this.commandSkill.bind(this))
    this._skillTypeWindow.setHandler('cancel', this.popScene.bind(this))
    this._skillTypeWindow.setHandler('pagedown', this.nextActor.bind(this))
    this._skillTypeWindow.setHandler('pageup', this.previousActor.bind(this))
    this.addWindow(this._skillTypeWindow)
  }

  createStatusWindow() {
    const wx = this._skillTypeWindow.width
    const wy = this._helpWindow.height
    const ww = Graphics.boxWidth - wx
    const wh = this._skillTypeWindow.height
    this._statusWindow = new Window_SkillStatus(wx, wy, ww, wh)
    this._statusWindow.reserveFaceImages()
    this.addWindow(this._statusWindow)
  }

  createItemWindow() {
    const wx = 0
    const wy = this._statusWindow.y + this._statusWindow.height
    const ww = Graphics.boxWidth
    const wh = Graphics.boxHeight - wy
    this._itemWindow = new Window_SkillList(wx, wy, ww, wh)
    this._itemWindow.setHelpWindow(this._helpWindow)
    this._itemWindow.setHandler('ok', this.onItemOk.bind(this))
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this))
    this._skillTypeWindow.setSkillWindow(this._itemWindow)
    this.addWindow(this._itemWindow)
  }

  refreshActor() {
    const actor = this.actor()
    this._skillTypeWindow.setActor(actor)
    this._statusWindow.setActor(actor)
    this._itemWindow.setActor(actor)
  }

  override user() {
    return this.actor()
  }

  commandSkill() {
    this._itemWindow.activate()
    this._itemWindow.selectLast()
  }

  onItemOk() {
    this.actor().setLastMenuSkill(this.item())
    this.determineItem()
  }

  onItemCancel() {
    this._itemWindow.deselect()
    this._skillTypeWindow.activate()
  }

  override playSeForItem() {
    SoundManager.playUseSkill()
  }

  override useItem() {
    super.useItem()
    this._statusWindow.refresh()
    this._itemWindow.refresh()
  }

  override onActorChange() {
    this.refreshActor()
    this._skillTypeWindow.activate()
  }
}
