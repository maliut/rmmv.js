import {Window_Selectable} from './Window_Selectable'
import {Graphics} from '../core/Graphics'
import {global} from '../managers/DataManager'

// Window_BattleStatus
//
// The window for displaying the status of party members on the battle screen.
export class Window_BattleStatus extends Window_Selectable {

  override initialize() {
    const width = this.windowWidth()
    const height = this.windowHeight()
    const x = Graphics.boxWidth - width
    const y = Graphics.boxHeight - height
    super.initialize(x, y, width, height)
    this.refresh()
    this.openness = 0
    return this
  }

  windowWidth() {
    return Graphics.boxWidth - 192
  }

  windowHeight() {
    return this.fittingHeight(this.numVisibleRows())
  }

  numVisibleRows() {
    return 4
  }

  override maxItems() {
    return global.$gameParty.battleMembers().length
  }

  override refresh() {
    this.contents.clear()
    this.drawAllItems()
  }

  override drawItem(index) {
    const actor = global.$gameParty.battleMembers()[index]
    this.drawBasicArea(this.basicAreaRect(index), actor)
    this.drawGaugeArea(this.gaugeAreaRect(index), actor)
  }

  basicAreaRect(index) {
    const rect = this.itemRectForText(index)
    rect.width -= this.gaugeAreaWidth() + 15
    return rect
  }

  gaugeAreaRect(index) {
    const rect = this.itemRectForText(index)
    rect.x += rect.width - this.gaugeAreaWidth()
    rect.width = this.gaugeAreaWidth()
    return rect
  }

  gaugeAreaWidth() {
    return 330
  }

  drawBasicArea(rect, actor) {
    this.drawActorName(actor, rect.x + 0, rect.y, 150)
    this.drawActorIcons(actor, rect.x + 156, rect.y, rect.width - 156)
  }

  drawGaugeArea(rect, actor) {
    if (global.$dataSystem.optDisplayTp) {
      this.drawGaugeAreaWithTp(rect, actor)
    } else {
      this.drawGaugeAreaWithoutTp(rect, actor)
    }
  }

  drawGaugeAreaWithTp(rect, actor) {
    this.drawActorHp(actor, rect.x + 0, rect.y, 108)
    this.drawActorMp(actor, rect.x + 123, rect.y, 96)
    this.drawActorTp(actor, rect.x + 234, rect.y, 96)
  }

  drawGaugeAreaWithoutTp(rect, actor) {
    this.drawActorHp(actor, rect.x + 0, rect.y, 201)
    this.drawActorMp(actor, rect.x + 216, rect.y, 114)
  }
}
