import {Window_SkillList} from './Window_SkillList'

// Window_BattleSkill
//
// The window for selecting a skill to use on the battle screen.
export class Window_BattleSkill extends Window_SkillList {

  constructor(x, y, width, height) {
    super(x, y, width, height)
    this.hide()
  }

  override show() {
    this.selectLast()
    this.showHelpWindow()
    super.show()
  }

  override hide() {
    this.hideHelpWindow()
    super.hide()
  }
}
