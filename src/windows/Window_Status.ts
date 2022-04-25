import {Window_Selectable} from './Window_Selectable'
import {Graphics} from '../core/Graphics'
import {TextManager} from '../managers/TextManager'
import {Game_Actor} from '../objects/Game_Actor'

// Window_Status
//
// The window for displaying full status on the status screen.
export class Window_Status extends Window_Selectable {

  private _actor: Game_Actor | null = null

  override initialize() {
    const width = Graphics.boxWidth
    const height = Graphics.boxHeight
    super.initialize(0, 0, width, height)
    this.refresh()
    this.activate()
    return this
  }

  setActor(actor: Game_Actor | null) {
    if (this._actor !== actor) {
      this._actor = actor
      this.refresh()
    }
  }

  override refresh() {
    this.contents.clear()
    if (this._actor) {
      const lineHeight = this.lineHeight()
      this.drawBlock1(this._actor, lineHeight * 0)
      this.drawHorzLine(lineHeight * 1)
      this.drawBlock2(this._actor, lineHeight * 2)
      this.drawHorzLine(lineHeight * 6)
      this.drawBlock3(this._actor, lineHeight * 7)
      this.drawHorzLine(lineHeight * 13)
      this.drawBlock4(this._actor, lineHeight * 14)
    }
  }

  drawBlock1(actor: Game_Actor, y: number) {
    this.drawActorName(actor, 6, y)
    this.drawActorClass(actor, 192, y)
    this.drawActorNickname(actor, 432, y)
  }

  drawBlock2(actor: Game_Actor, y: number) {
    this.drawActorFace(actor, 12, y)
    this.drawBasicInfo(actor, 204, y)
    this.drawExpInfo(actor, 456, y)
  }

  drawBlock3(actor: Game_Actor, y: number) {
    this.drawParameters(actor, 48, y)
    this.drawEquipments(actor, 432, y)
  }

  drawBlock4(actor: Game_Actor, y: number) {
    this.drawProfile(actor, 6, y)
  }

  drawHorzLine(y: number) {
    const lineY = y + this.lineHeight() / 2 - 1
    this.contents.paintOpacity = 48
    this.contents.fillRect(0, lineY, this.contentsWidth(), 2, this.lineColor())
    this.contents.paintOpacity = 255
  }

  lineColor() {
    return this.normalColor()
  }

  drawBasicInfo(actor: Game_Actor, x: number, y: number) {
    const lineHeight = this.lineHeight()
    this.drawActorLevel(actor, x, y + lineHeight * 0)
    this.drawActorIcons(actor, x, y + lineHeight * 1)
    this.drawActorHp(actor, x, y + lineHeight * 2)
    this.drawActorMp(actor, x, y + lineHeight * 3)
  }

  drawParameters(actor: Game_Actor, x: number, y: number) {
    const lineHeight = this.lineHeight()
    for (let i = 0; i < 6; i++) {
      const paramId = i + 2
      const y2 = y + lineHeight * i
      this.changeTextColor(this.systemColor())
      this.drawText(TextManager.param(paramId), x, y2, 160)
      this.resetTextColor()
      this.drawText(actor.param(paramId).toString(), x + 160, y2, 60, 'right')
    }
  }

  drawExpInfo(actor: Game_Actor, x: number, y: number) {
    const lineHeight = this.lineHeight()
    const expTotal = TextManager.expTotal.format(TextManager.exp)
    const expNext = TextManager.expNext.format(TextManager.level)
    let value1 = actor.currentExp().toString()
    let value2 = actor.nextRequiredExp().toString()
    if (actor.isMaxLevel()) {
      value1 = '-------'
      value2 = '-------'
    }
    this.changeTextColor(this.systemColor())
    this.drawText(expTotal, x, y + lineHeight * 0, 270)
    this.drawText(expNext, x, y + lineHeight * 2, 270)
    this.resetTextColor()
    this.drawText(value1, x, y + lineHeight * 1, 270, 'right')
    this.drawText(value2, x, y + lineHeight * 3, 270, 'right')
  }

  drawEquipments(actor: Game_Actor, x: number, y: number) {
    const equips = actor.equips()
    const count = Math.min(equips.length, this.maxEquipmentLines())
    for (let i = 0; i < count; i++) {
      this.drawItemName(equips[i], x, y + this.lineHeight() * i)
    }
  }

  drawProfile(actor: Game_Actor, x: number, y: number) {
    this.drawTextEx(actor.profile(), x, y)
  }

  maxEquipmentLines() {
    return 6
  }
}
