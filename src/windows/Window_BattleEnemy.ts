import {Window_Selectable} from './Window_Selectable'
import {Graphics} from '../core/Graphics'
import {global} from '../managers/DataManager'
import {Game_Battler} from '../objects/Game_Battler'

// Window_BattleEnemy
//
// The window for selecting a target enemy on the battle screen.
export class Window_BattleEnemy extends Window_Selectable {

  private _enemies: Game_Battler[] = []

  override initialize(x: number, y: number) {
    const width = this.windowWidth()
    const height = this.windowHeight()
    super.initialize(x, y, width, height)
    this.refresh()
    this.hide()
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

  override maxCols() {
    return 2
  }

  override maxItems() {
    return this._enemies.length
  }

  enemy() {
    return this._enemies[this.index()]
  }

  enemyIndex() {
    const enemy = this.enemy()
    return enemy ? enemy.index() : -1
  }

  override drawItem(index: number) {
    this.resetTextColor()
    const name = this._enemies[index].name()
    const rect = this.itemRectForText(index)
    this.drawText(name, rect.x, rect.y, rect.width)
  }

  override show() {
    this.refresh()
    this.select(0)
    super.show()
  }

  override hide() {
    super.hide()
    global.$gameTroop.select(null)
  }

  override refresh() {
    this._enemies = global.$gameTroop.aliveMembers()
    super.refresh()
  }

  override select(index: number) {
    super.select(index)
    global.$gameTroop.select(this.enemy())
  }
}
