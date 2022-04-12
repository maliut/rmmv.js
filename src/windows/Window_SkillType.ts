import {Window_Command} from './Window_Command'
import {global} from '../managers/DataManager'

// Window_SkillType
//
// The window for selecting a skill type on the skill screen.
export class Window_SkillType extends Window_Command {

  private _actor = null
  private _skillWindow

  override windowWidth() {
    return 240
  }

  setActor(actor) {
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
      skillTypes.sort(function (a, b) {
        return a - b
      })
      skillTypes.forEach(function (stypeId) {
        const name = global.$dataSystem.skillTypes[stypeId]
        this.addCommand(name, 'skill', true, stypeId)
      }, this)
    }
  }

  override update() {
    super.update()
    if (this._skillWindow) {
      this._skillWindow.setStypeId(this.currentExt())
    }
  }

  setSkillWindow(skillWindow) {
    this._skillWindow = skillWindow
  }

  selectLast() {
    const skill = this._actor.lastMenuSkill()
    if (skill) {
      this.selectExt(skill.stypeId)
    } else {
      this.select(0)
    }
  }
}
