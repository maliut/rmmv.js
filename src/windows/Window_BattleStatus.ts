import {Window_Selectable} from './Window_Selectable'
import {Graphics} from '../core/Graphics'
import {global} from '../managers/DataManager'
import {Rectangle} from '../core/Rectangle'
import {Game_Actor} from '../objects/Game_Actor'

// Window_BattleStatus
//
// The window for displaying the status of party members on the battle screen.
export class Window_BattleStatus extends Window_Selectable {

  override initialize(x = 0, y = 0) {
    const width = this.windowWidth()
    const height = this.windowHeight()
    x = Graphics.boxWidth - width
    y = Graphics.boxHeight - height
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

  override drawItem(index: number) {
    const actor = global.$gameParty.battleMembers()[index]
    this.drawBasicArea(this.basicAreaRect(index), actor)
    this.drawGaugeArea(this.gaugeAreaRect(index), actor)
  }

  basicAreaRect(index: number) {
    const rect = this.itemRectForText(index)
    rect.width -= this.gaugeAreaWidth() + 15
    return rect
  }

  gaugeAreaRect(index: number) {
    const rect = this.itemRectForText(index)
    rect.x += rect.width - this.gaugeAreaWidth()
    rect.width = this.gaugeAreaWidth()
    return rect
  }

  gaugeAreaWidth() {
    return 330
  }

  drawBasicArea(rect: Rectangle, actor: Game_Actor) {
    this.drawActorName(actor, rect.x + 0, rect.y, 150)
    this.drawActorIcons(actor, rect.x + 156, rect.y, rect.width - 156)
  }

  drawGaugeArea(rect: Rectangle, actor: Game_Actor) {
    if (global.$dataSystem.optDisplayTp) {
      this.drawGaugeAreaWithTp(rect, actor)
    } else {
      this.drawGaugeAreaWithoutTp(rect, actor)
    }
  }

  drawGaugeAreaWithTp(rect: Rectangle, actor: Game_Actor) {
    this.drawActorHp(actor, rect.x + 0, rect.y, 108)
    this.drawActorMp(actor, rect.x + 123, rect.y, 96)
    this.drawActorTp(actor, rect.x + 234, rect.y, 96)
  }

  drawGaugeAreaWithoutTp(rect: Rectangle, actor: Game_Actor) {
    this.drawActorHp(actor, rect.x + 0, rect.y, 201)
    this.drawActorMp(actor, rect.x + 216, rect.y, 114)
  }
}
