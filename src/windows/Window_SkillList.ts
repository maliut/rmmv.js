import {Window_Selectable} from './Window_Selectable'
import {global} from '../managers/DataManager'

// Window_SkillList
//
// The window for selecting a skill on the skill screen.
export class Window_SkillList extends Window_Selectable {

  private _actor = null
  private _stypeId = 0
  private _data = []

  setActor(actor) {
    if (this._actor !== actor) {
      this._actor = actor
      this.refresh()
      this.resetScroll()
    }
  }

  setStypeId(stypeId) {
    if (this._stypeId !== stypeId) {
      this._stypeId = stypeId
      this.refresh()
      this.resetScroll()
    }
  }

  override maxCols() {
    return 2
  }

  override spacing() {
    return 48
  }

  override maxItems() {
    return this._data ? this._data.length : 1
  }

  item() {
    return this._data && this.index() >= 0 ? this._data[this.index()] : null
  }

  override isCurrentItemEnabled() {
    return this.isEnabled(this._data[this.index()])
  }

  includes(item) {
    return item && item.stypeId === this._stypeId
  }

  isEnabled(item) {
    return this._actor && this._actor.canUse(item)
  }

  makeItemList() {
    if (this._actor) {
      this._data = this._actor.skills().filter(function (item) {
        return this.includes(item)
      }, this)
    } else {
      this._data = []
    }
  }

  selectLast() {
    let skill
    if (global.$gameParty.inBattle()) {
      skill = this._actor.lastBattleSkill()
    } else {
      skill = this._actor.lastMenuSkill()
    }
    const index = this._data.indexOf(skill)
    this.select(index >= 0 ? index : 0)
  }

  override drawItem(index) {
    const skill = this._data[index]
    if (skill) {
      const costWidth = this.costWidth()
      const rect = this.itemRect(index)
      rect.width -= this.textPadding()
      this.changePaintOpacity(this.isEnabled(skill))
      this.drawItemName(skill, rect.x, rect.y, rect.width - costWidth)
      this.drawSkillCost(skill, rect.x, rect.y, rect.width)
      this.changePaintOpacity(1)
    }
  }

  costWidth() {
    return this.textWidth('000')
  }

  drawSkillCost(skill, x, y, width) {
    if (this._actor.skillTpCost(skill) > 0) {
      this.changeTextColor(this.tpCostColor())
      this.drawText(this._actor.skillTpCost(skill), x, y, width, 'right')
    } else if (this._actor.skillMpCost(skill) > 0) {
      this.changeTextColor(this.mpCostColor())
      this.drawText(this._actor.skillMpCost(skill), x, y, width, 'right')
    }
  }

  override updateHelp() {
    this.setHelpWindowItem(this.item())
  }

  override refresh() {
    this.makeItemList()
    this.createContents()
    this.drawAllItems()
  }
}
