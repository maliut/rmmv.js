import {Window_Command} from './Window_Command'
import {global} from '../managers/DataManager'
import {Game_Actor} from '../objects/Game_Actor'
import {assert} from '../utils'
import {Window_SkillList} from './Window_SkillList'

// Window_SkillType
//
// The window for selecting a skill type on the skill screen.
export class Window_SkillType extends Window_Command {

  private _actor: Game_Actor | null = null
  private _skillWindow: Window_SkillList | null = null

  override windowWidth() {
    return 240
  }

  setActor(actor: Game_Actor | null) {
    if (this._actor !== actor) {
      this._actor = actor
      this.refresh()
      this.selectLast()
    }
  }

  override numVisibleRows() {
    return 4
  }

  override makeCommandList() {
    if (this._actor) {
      const skillTypes = this._actor.addedSkillTypes()
      skillTypes.sort((a, b) => a - b)
      skillTypes.forEach((stypeId) => {
        const name = global.$dataSystem.skillTypes[stypeId]
        this.addCommand(name, 'skill', true, stypeId)
      })
    }
  }

  override update() {
    super.update()
    if (this._skillWindow) {
      this._skillWindow.setStypeId(this.currentExt()!)
    }
  }

  setSkillWindow(skillWindow: Window_SkillList) {
    this._skillWindow = skillWindow
  }

  selectLast() {
    assert(this._actor !== null)
    const skill = this._actor.lastMenuSkill()
    if (skill) {
      this.selectExt(skill.stypeId)
    } else {
      this.select(0)
    }
  }
}
