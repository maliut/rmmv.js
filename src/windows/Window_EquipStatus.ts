import {Window_Base} from './Window_Base'
import {TextManager} from '../managers/TextManager'

// Window_EquipStatus
//
// The window for displaying parameter changes on the equipment screen.
export class Window_EquipStatus extends Window_Base {

  private _actor = null
  private _tempActor = null

  override initialize(x, y) {
    const width = this.windowWidth()
    const height = this.windowHeight()
    super.initialize(x, y, width, height)
    this.refresh()
    return this
  }

  windowWidth() {
    return 312
  }

  windowHeight() {
    return this.fittingHeight(this.numVisibleRows())
  }

  numVisibleRows() {
    return 7
  }

  setActor(actor) {
    if (this._actor !== actor) {
      this._actor = actor
      this.refresh()
    }
  }

  refresh() {
    this.contents.clear()
    if (this._actor) {
      this.drawActorName(this._actor, this.textPadding(), 0)
      for (let i = 0; i < 6; i++) {
        this.drawItem(0, this.lineHeight() * (1 + i), 2 + i)
      }
    }
  }

  setTempActor(tempActor) {
    if (this._tempActor !== tempActor) {
      this._tempActor = tempActor
      this.refresh()
    }
  }

  drawItem(x, y, paramId) {
    this.drawParamName(x + this.textPadding(), y, paramId)
    if (this._actor) {
      this.drawCurrentParam(x + 140, y, paramId)
    }
    this.drawRightArrow(x + 188, y)
    if (this._tempActor) {
      this.drawNewParam(x + 222, y, paramId)
    }
  }

  drawParamName(x, y, paramId) {
    this.changeTextColor(this.systemColor())
    this.drawText(TextManager.param(paramId), x, y, 120)
  }

  drawCurrentParam(x, y, paramId) {
    this.resetTextColor()
    this.drawText(this._actor.param(paramId), x, y, 48, 'right')
  }

  drawRightArrow(x, y) {
    this.changeTextColor(this.systemColor())
    this.drawText('\u2192', x, y, 32, 'center')
  }

  drawNewParam(x, y, paramId) {
    const newValue = this._tempActor.param(paramId)
    const diffvalue = newValue - this._actor.param(paramId)
    this.changeTextColor(this.paramchangeTextColor(diffvalue))
    this.drawText(newValue, x, y, 48, 'right')
  }
}
