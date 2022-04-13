import {Window_Selectable} from './Window_Selectable'
import {ImageManager} from '../managers/ImageManager'
import {Graphics} from '../core/Graphics'
import {Window_Base} from './Window_Base'
import {global} from '../managers/DataManager'

// Window_MenuStatus
//
// The window for displaying party member status on the menu screen.
export class Window_MenuStatus extends Window_Selectable {

  private _formationMode = false
  private _pendingIndex = -1

  override initialize(x, y) {
    const width = this.windowWidth()
    const height = this.windowHeight()
    super.initialize(x, y, width, height)
    this.refresh()
    return this
  }

  windowWidth() {
    return Graphics.boxWidth - 240
  }

  windowHeight() {
    return Graphics.boxHeight
  }

  override maxItems() {
    return global.$gameParty.size()
  }

  override itemHeight() {
    const clientHeight = this.height - this.padding * 2
    return Math.floor(clientHeight / this.numVisibleRows())
  }

  numVisibleRows() {
    return 4
  }

  loadImages() {
    global.$gameParty.members().forEach(function (actor) {
      ImageManager.reserveFace(actor.faceName())
    }, this)
  }

  override drawItem(index) {
    this.drawItemBackground(index)
    this.drawItemImage(index)
    this.drawItemStatus(index)
  }

  drawItemBackground(index) {
    if (index === this._pendingIndex) {
      const rect = this.itemRect(index)
      const color = this.pendingColor()
      this.changePaintOpacity(false)
      this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color)
      this.changePaintOpacity(true)
    }
  }

  drawItemImage(index) {
    const actor = global.$gameParty.members()[index]
    const rect = this.itemRect(index)
    this.changePaintOpacity(actor.isBattleMember())
    this.drawActorFace(actor, rect.x + 1, rect.y + 1, Window_Base._faceWidth, Window_Base._faceHeight)
    this.changePaintOpacity(true)
  }

  drawItemStatus(index) {
    const actor = global.$gameParty.members()[index]
    const rect = this.itemRect(index)
    const x = rect.x + 162
    const y = rect.y + rect.height / 2 - this.lineHeight() * 1.5
    const width = rect.width - x - this.textPadding()
    this.drawActorSimpleStatus(actor, x, y, width)
  }

  override processOk() {
    super.processOk()
    global.$gameParty.setMenuActor(global.$gameParty.members()[this.index()])
  }

  override isCurrentItemEnabled() {
    if (this._formationMode) {
      const actor = global.$gameParty.members()[this.index()]
      return actor && actor.isFormationChangeOk()
    } else {
      return true
    }
  }

  selectLast() {
    this.select(global.$gameParty.menuActor().index() || 0)
  }

  formationMode() {
    return this._formationMode
  }

  setFormationMode(formationMode) {
    this._formationMode = formationMode
  }

  pendingIndex() {
    return this._pendingIndex
  }

  setPendingIndex(index) {
    const lastPendingIndex = this._pendingIndex
    this._pendingIndex = index
    this.redrawItem(this._pendingIndex)
    this.redrawItem(lastPendingIndex)
  }
}
