import {Window_Base} from './Window_Base'
import {TextManager} from '../managers/TextManager'
import {Game_Actor} from '../objects/Game_Actor'

// Window_EquipStatus
//
// The window for displaying parameter changes on the equipment screen.
export class Window_EquipStatus extends Window_Base {

  private _actor: Game_Actor | null = null
  private _tempActor: Game_Actor | null = null

  override initialize(x: number, y: number) {
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

  setActor(actor: Game_Actor | null) {
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

  setTempActor(tempActor: Game_Actor | null) {
    if (this._tempActor !== tempActor) {
      this._tempActor = tempActor
      this.refresh()
    }
  }

  drawItem(x: number, y: number, paramId: number) {
    this.drawParamName(x + this.textPadding(), y, paramId)
    if (this._actor) {
      this.drawCurrentParam(x + 140, y, paramId)
    }
    this.drawRightArrow(x + 188, y)
    if (this._tempActor) {
      this.drawNewParam(x + 222, y, paramId)
    }
  }

  drawParamName(x: number, y: number, paramId: number) {
    this.changeTextColor(this.systemColor())
    this.drawText(TextManager.param(paramId), x, y, 120)
  }

  drawCurrentParam(x: number, y: number, paramId: number) {
    this.resetTextColor()
    this.drawText(this._actor!.param(paramId).toString(), x, y, 48, 'right')
  }

  drawRightArrow(x: number, y: number) {
    this.changeTextColor(this.systemColor())
    this.drawText('\u2192', x, y, 32, 'center')
  }

  drawNewParam(x: number, y: number, paramId: number) {
    const newValue = this._tempActor!.param(paramId)
    const diffvalue = newValue - this._actor!.param(paramId)
    this.changeTextColor(this.paramchangeTextColor(diffvalue))
    this.drawText(newValue.toString(), x, y, 48, 'right')
  }
}
