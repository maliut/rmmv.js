import {Window} from '../core/Window'
import {ImageManager} from '../managers/ImageManager'
import {TextManager} from '../managers/TextManager'
import {global} from '../managers/DataManager'
import {Bitmap} from '../core/Bitmap'
import {Sprite} from '../core/Sprite'
import * as PIXI from 'pixi.js'
import {Game_Battler} from '../objects/Game_Battler'
import {Game_Actor} from '../objects/Game_Actor'
import { Data_ItemBase } from '../types/global'
import {TextState} from '../types/index'

// Window_Base
//
// The superclass of all windows within the game.
export class Window_Base extends Window {

  private static _iconWidth = 32
  private static _iconHeight = 32
  protected static _faceWidth = 144
  protected static _faceHeight = 144

  private _opening = false
  private _closing = false
  private _dimmerSprite: Sprite | null = null

  // 注：这里单独提取出 initialize 方法来做初始化，是因为子类中有需要在 super 前调用 this 的逻辑
  initialize(x = 0, y = 0, width = 0, height = 0) {
    this.loadWindowskin()
    this.move(x, y, width, height)
    this.updatePadding()
    this.updateBackOpacity()
    this.updateTone()
    this.createContents()
    return this
  }

  lineHeight() {
    return 36
  }

  standardFontFace() {
    if (global.$gameSystem.isChinese()) {
      return 'SimHei, Heiti TC, sans-serif'
    } else if (global.$gameSystem.isKorean()) {
      return 'Dotum, AppleGothic, sans-serif'
    } else {
      return 'GameFont'
    }
  }

  standardFontSize() {
    return 28
  }

  standardPadding() {
    return 18
  }

  textPadding() {
    return 6
  }

  standardBackOpacity() {
    return 192
  }

  loadWindowskin() {
    this.windowskin = ImageManager.loadSystem('Window')
  }

  updatePadding() {
    this.padding = this.standardPadding()
  }

  updateBackOpacity() {
    this.backOpacity = this.standardBackOpacity()
  }

  contentsWidth() {
    return this.width - this.standardPadding() * 2
  }

  contentsHeight() {
    return this.height - this.standardPadding() * 2
  }

  fittingHeight(numLines: number) {
    return numLines * this.lineHeight() + this.standardPadding() * 2
  }

  updateTone() {
    const tone = global.$gameSystem.windowTone()
    this.setTone(tone[0], tone[1], tone[2])
  }

  createContents() {
    this.contents = new Bitmap(this.contentsWidth(), this.contentsHeight())
    this.resetFontSettings()
  }

  resetFontSettings() {
    this.contents.fontFace = this.standardFontFace()
    this.contents.fontSize = this.standardFontSize()
    this.resetTextColor()
  }

  resetTextColor() {
    this.changeTextColor(this.normalColor())
  }

  override update() {
    super.update()
    this.updateTone()
    this.updateOpen()
    this.updateClose()
    this.updateBackgroundDimmer()
  }

  updateOpen() {
    if (this._opening) {
      this.openness += 32
      if (this.isOpen()) {
        this._opening = false
      }
    }
  }

  updateClose() {
    if (this._closing) {
      this.openness -= 32
      if (this.isClosed()) {
        this._closing = false
      }
    }
  }

  open() {
    if (!this.isOpen()) {
      this._opening = true
    }
    this._closing = false
  }

  close() {
    if (!this.isClosed()) {
      this._closing = true
    }
    this._opening = false
  }

  isOpening() {
    return this._opening
  }

  isClosing() {
    return this._closing
  }

  show() {
    this.visible = true
  }

  hide() {
    this.visible = false
  }

  activate() {
    this.active = true
  }

  deactivate() {
    this.active = false
  }

  textColor(n: number) {
    const px = 96 + (n % 8) * 12 + 6
    const py = 144 + Math.floor(n / 8) * 12 + 6
    return this.windowskin!.getPixel(px, py)
  }

  normalColor() {
    return this.textColor(0)
  }

  systemColor() {
    return this.textColor(16)
  }

  crisisColor() {
    return this.textColor(17)
  }

  deathColor() {
    return this.textColor(18)
  }

  gaugeBackColor() {
    return this.textColor(19)
  }

  hpGaugeColor1() {
    return this.textColor(20)
  }

  hpGaugeColor2() {
    return this.textColor(21)
  }

  mpGaugeColor1() {
    return this.textColor(22)
  }

  mpGaugeColor2() {
    return this.textColor(23)
  }

  mpCostColor() {
    return this.textColor(23)
  }

  powerUpColor() {
    return this.textColor(24)
  }

  powerDownColor() {
    return this.textColor(25)
  }

  tpGaugeColor1() {
    return this.textColor(28)
  }

  tpGaugeColor2() {
    return this.textColor(29)
  }

  tpCostColor() {
    return this.textColor(29)
  }

  pendingColor() {
    return this.windowskin!.getPixel(120, 120)
  }

  translucentOpacity() {
    return 160
  }

  changeTextColor(color: string) {
    this.contents.textColor = color
  }

  changePaintOpacity(enabled: boolean) {
    this.contents.paintOpacity = enabled ? 255 : this.translucentOpacity()
  }

  drawText(text: string, x: number, y: number, maxWidth?: number, align?: CanvasTextAlign) {
    this.contents.drawText(text, x, y, maxWidth, this.lineHeight(), align)
  }

  textWidth(text: string) {
    return this.contents.measureTextWidth(text)
  }

  drawTextEx(text: string, x: number, y: number) {
    if (text) {
      const textState: TextState = {
        index: 0,
        x: x,
        y: y,
        left: x,
        text: this.convertEscapeCharacters(text),
        height: 0
      }
      textState.height = this.calcTextHeight(textState, false)
      this.resetFontSettings()
      while (textState.index < textState.text.length) {
        this.processCharacter(textState)
      }
      return textState.x - x
    } else {
      return 0
    }
  }

  convertEscapeCharacters(text: string, arg1 = '') {
    text = text.replace(/\\/g, '\x1b')
    // eslint-disable-next-line no-control-regex
    text = text.replace(/\x1b\x1b/g, '\\')
    // eslint-disable-next-line no-control-regex
    text = text.replace(/\x1bV\[(\d+)\]/gi, () => global.$gameVariables.value(parseInt(arg1)).toString())
    // eslint-disable-next-line no-control-regex
    text = text.replace(/\x1bV\[(\d+)\]/gi, () => global.$gameVariables.value(parseInt(arg1)).toString())
    // eslint-disable-next-line no-control-regex
    text = text.replace(/\x1bN\[(\d+)\]/gi, () => this.actorName(parseInt(arg1)))
    // eslint-disable-next-line no-control-regex
    text = text.replace(/\x1bP\[(\d+)\]/gi, () => this.partyMemberName(parseInt(arg1)))
    // eslint-disable-next-line no-control-regex
    text = text.replace(/\x1bG/gi, TextManager.currencyUnit)
    return text
  }

  actorName(n: number) {
    const actor = n >= 1 ? global.$gameActors.actor(n) : null
    return actor ? actor.name() : ''
  }

  partyMemberName(n: number) {
    const actor = n >= 1 ? global.$gameParty.members()[n - 1] : null
    return actor ? actor.name() : ''
  }

  processCharacter(textState: TextState) {
    switch (textState.text[textState.index]) {
    case '\n':
      this.processNewLine(textState)
      break
    case '\f':
      this.processNewPage(textState)
      break
    case '\x1b':
      this.processEscapeCharacter(this.obtainEscapeCode(textState), textState)
      break
    default:
      this.processNormalCharacter(textState)
      break
    }
  }

  processNormalCharacter(textState: TextState) {
    const c = textState.text[textState.index++]
    const w = this.textWidth(c)
    this.contents.drawText(c, textState.x, textState.y, w * 2, textState.height)
    textState.x += w
  }

  processNewLine(textState: TextState) {
    textState.x = textState.left
    textState.y += textState.height
    textState.height = this.calcTextHeight(textState, false)
    textState.index++
  }

  processNewPage(textState: TextState) {
    textState.index++
  }

  obtainEscapeCode(textState: TextState) {
    textState.index++
    const regExp = /^[$.|^!><{}\\]|^[A-Z]+/i
    const arr = regExp.exec(textState.text.slice(textState.index))
    if (arr) {
      textState.index += arr[0].length
      return arr[0].toUpperCase()
    } else {
      return ''
    }
  }

  obtainEscapeParam(textState: TextState) {
    const arr = /^\[\d+\]/.exec(textState.text.slice(textState.index))
    if (arr) {
      textState.index += arr[0].length
      return parseInt(arr[0].slice(1))
    } else {
      return 0
    }
  }

  processEscapeCharacter(code: string, textState: TextState) {
    switch (code) {
    case 'C':
      this.changeTextColor(this.textColor(this.obtainEscapeParam(textState)))
      break
    case 'I':
      this.processDrawIcon(this.obtainEscapeParam(textState), textState)
      break
    case '{':
      this.makeFontBigger()
      break
    case '}':
      this.makeFontSmaller()
      break
    }
  }

  processDrawIcon(iconIndex: number, textState: TextState) {
    this.drawIcon(iconIndex, textState.x + 2, textState.y + 2)
    textState.x += Window_Base._iconWidth + 4
  }

  makeFontBigger() {
    if (this.contents.fontSize <= 96) {
      this.contents.fontSize += 12
    }
  }

  makeFontSmaller() {
    if (this.contents.fontSize >= 24) {
      this.contents.fontSize -= 12
    }
  }

  calcTextHeight(textState: TextState, all: boolean) {
    const lastFontSize = this.contents.fontSize
    let textHeight = 0
    const lines = textState.text.slice(textState.index).split('\n')
    const maxLines = all ? lines.length : 1

    for (let i = 0; i < maxLines; i++) {
      let maxFontSize = this.contents.fontSize
      // eslint-disable-next-line no-control-regex
      const regExp = /\x1b[{}]/g
      for (; ;) {
        const array = regExp.exec(lines[i])
        if (array) {
          if (array[0] === '\x1b{') {
            this.makeFontBigger()
          }
          if (array[0] === '\x1b}') {
            this.makeFontSmaller()
          }
          if (maxFontSize < this.contents.fontSize) {
            maxFontSize = this.contents.fontSize
          }
        } else {
          break
        }
      }
      textHeight += maxFontSize + 8
    }

    this.contents.fontSize = lastFontSize
    return textHeight
  }

  drawIcon(iconIndex: number, x: number, y: number) {
    const bitmap = ImageManager.loadSystem('IconSet')
    const pw = Window_Base._iconWidth
    const ph = Window_Base._iconHeight
    const sx = iconIndex % 16 * pw
    const sy = Math.floor(iconIndex / 16) * ph
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y)
  }

  drawFace(faceName: string, faceIndex: number, x: number, y: number, width = Window_Base._faceWidth, height = Window_Base._faceHeight) {
    const bitmap = ImageManager.loadFace(faceName)
    const pw = Window_Base._faceWidth
    const ph = Window_Base._faceHeight
    const sw = Math.min(width, pw)
    const sh = Math.min(height, ph)
    const dx = Math.floor(x + Math.max(width - pw, 0) / 2)
    const dy = Math.floor(y + Math.max(height - ph, 0) / 2)
    const sx = faceIndex % 4 * pw + (pw - sw) / 2
    const sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2
    this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy)
  }

  drawCharacter(characterName: string, characterIndex: number, x: number, y: number) {
    const bitmap = ImageManager.loadCharacter(characterName)
    const big = ImageManager.isBigCharacter(characterName)
    const pw = bitmap.width / (big ? 3 : 12)
    const ph = bitmap.height / (big ? 4 : 8)
    const n = characterIndex
    const sx = (n % 4 * 3 + 1) * pw
    const sy = (Math.floor(n / 4) * 4) * ph
    this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph)
  }

  drawGauge(x: number, y: number, width: number, rate: number, color1: string, color2: string) {
    const fillW = Math.floor(width * rate)
    const gaugeY = y + this.lineHeight() - 8
    this.contents.fillRect(x, gaugeY, width, 6, this.gaugeBackColor())
    this.contents.gradientFillRect(x, gaugeY, fillW, 6, color1, color2)
  }

  hpColor(actor: Game_Battler) {
    if (actor.isDead()) {
      return this.deathColor()
    } else if (actor.isDying()) {
      return this.crisisColor()
    } else {
      return this.normalColor()
    }
  }

  mpColor(actor: Game_Battler) {
    return this.normalColor()
  }

  tpColor(actor: Game_Battler) {
    return this.normalColor()
  }

  drawActorCharacter(actor: Game_Actor, x: number, y: number) {
    this.drawCharacter(actor.characterName(), actor.characterIndex(), x, y)
  }

  drawActorFace(actor: Game_Actor, x: number, y: number, width?: number, height?: number) {
    this.drawFace(actor.faceName(), actor.faceIndex(), x, y, width, height)
  }

  drawActorName(actor: Game_Actor, x: number, y: number, width = 168) {
    this.changeTextColor(this.hpColor(actor))
    this.drawText(actor.name(), x, y, width)
  }

  drawActorClass(actor: Game_Actor, x: number, y: number, width = 168) {
    this.resetTextColor()
    this.drawText(actor.currentClass().name, x, y, width)
  }

  drawActorNickname(actor: Game_Actor, x: number, y: number, width = 270) {
    this.resetTextColor()
    this.drawText(actor.nickname(), x, y, width)
  }

  drawActorLevel(actor: Game_Actor, x: number, y: number) {
    this.changeTextColor(this.systemColor())
    this.drawText(TextManager.levelA, x, y, 48)
    this.resetTextColor()
    this.drawText(actor.level.toString(), x + 84, y, 36, 'right')
  }

  drawActorIcons(actor: Game_Actor, x: number, y: number, width = 144) {
    const icons = actor.allIcons().slice(0, Math.floor(width / Window_Base._iconWidth))
    for (let i = 0; i < icons.length; i++) {
      this.drawIcon(icons[i], x + Window_Base._iconWidth * i, y + 2)
    }
  }

  drawCurrentAndMax(current: string, max: string, x: number, y: number,
    width: number, color1: string, color2: string) {
    const labelWidth = this.textWidth('HP')
    const valueWidth = this.textWidth('0000')
    const slashWidth = this.textWidth('/')
    const x1 = x + width - valueWidth
    const x2 = x1 - slashWidth
    const x3 = x2 - valueWidth
    if (x3 >= x + labelWidth) {
      this.changeTextColor(color1)
      this.drawText(current, x3, y, valueWidth, 'right')
      this.changeTextColor(color2)
      this.drawText('/', x2, y, slashWidth, 'right')
      this.drawText(max, x1, y, valueWidth, 'right')
    } else {
      this.changeTextColor(color1)
      this.drawText(current, x1, y, valueWidth, 'right')
    }
  }

  drawActorHp(actor: Game_Actor, x: number, y: number, width = 186) {
    const color1 = this.hpGaugeColor1()
    const color2 = this.hpGaugeColor2()
    this.drawGauge(x, y, width, actor.hpRate(), color1, color2)
    this.changeTextColor(this.systemColor())
    this.drawText(TextManager.hpA, x, y, 44)
    this.drawCurrentAndMax(actor.hp.toString(), actor.mhp.toString(), x, y, width,
      this.hpColor(actor), this.normalColor())
  }

  drawActorMp(actor: Game_Actor, x: number, y: number, width = 186) {
    const color1 = this.mpGaugeColor1()
    const color2 = this.mpGaugeColor2()
    this.drawGauge(x, y, width, actor.mpRate(), color1, color2)
    this.changeTextColor(this.systemColor())
    this.drawText(TextManager.mpA, x, y, 44)
    this.drawCurrentAndMax(actor.mp.toString(), actor.mmp.toString(), x, y, width,
      this.mpColor(actor), this.normalColor())
  }

  drawActorTp(actor: Game_Actor, x: number, y: number, width = 96) {
    const color1 = this.tpGaugeColor1()
    const color2 = this.tpGaugeColor2()
    this.drawGauge(x, y, width, actor.tpRate(), color1, color2)
    this.changeTextColor(this.systemColor())
    this.drawText(TextManager.tpA, x, y, 44)
    this.changeTextColor(this.tpColor(actor))
    this.drawText(actor.tp.toString(), x + width - 64, y, 64, 'right')
  }

  drawActorSimpleStatus(actor: Game_Actor, x: number, y: number, width: number) {
    const lineHeight = this.lineHeight()
    const x2 = x + 180
    const width2 = Math.min(200, width - 180 - this.textPadding())
    this.drawActorName(actor, x, y)
    this.drawActorLevel(actor, x, y + lineHeight * 1)
    this.drawActorIcons(actor, x, y + lineHeight * 2)
    this.drawActorClass(actor, x2, y)
    this.drawActorHp(actor, x2, y + lineHeight * 1, width2)
    this.drawActorMp(actor, x2, y + lineHeight * 2, width2)
  }

  drawItemName(item: Data_ItemBase | null, x: number, y: number, width = 312) {
    if (item) {
      const iconBoxWidth = Window_Base._iconWidth + 4
      this.resetTextColor()
      this.drawIcon(item.iconIndex, x + 2, y + 2)
      this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth)
    }
  }

  drawCurrencyValue(value: string, unit: string, x: number, y: number, width: number) {
    const unitWidth = Math.min(80, this.textWidth(unit))
    this.resetTextColor()
    this.drawText(value, x, y, width - unitWidth - 6, 'right')
    this.changeTextColor(this.systemColor())
    this.drawText(unit, x + width - unitWidth, y, unitWidth, 'right')
  }

  paramchangeTextColor(change: number) {
    if (change > 0) {
      return this.powerUpColor()
    } else if (change < 0) {
      return this.powerDownColor()
    } else {
      return this.normalColor()
    }
  }

  setBackgroundType(type: number) {
    if (type === 0) {
      this.opacity = 255
    } else {
      this.opacity = 0
    }
    if (type === 1) {
      this.showBackgroundDimmer()
    } else {
      this.hideBackgroundDimmer()
    }
  }

  showBackgroundDimmer() {
    if (!this._dimmerSprite) {
      this._dimmerSprite = new Sprite()
      this._dimmerSprite.bitmap = new Bitmap(0, 0)
      this.addChildToBack(this._dimmerSprite)
    }
    const bitmap = this._dimmerSprite.bitmap!
    if (bitmap.width !== this.width || bitmap.height !== this.height) {
      this.refreshDimmerBitmap()
    }
    this._dimmerSprite.visible = true
    this.updateBackgroundDimmer()
  }

  hideBackgroundDimmer() {
    if (this._dimmerSprite) {
      this._dimmerSprite.visible = false
    }
  }

  updateBackgroundDimmer() {
    if (this._dimmerSprite) {
      this._dimmerSprite.opacity = this.openness
    }
  }

  refreshDimmerBitmap() {
    if (this._dimmerSprite) {
      const bitmap = this._dimmerSprite.bitmap!
      const w = this.width
      const h = this.height
      const m = this.padding
      const c1 = this.dimColor1()
      const c2 = this.dimColor2()
      bitmap.resize(w, h)
      bitmap.gradientFillRect(0, 0, w, m, c2, c1, true)
      bitmap.fillRect(0, m, w, h - m * 2, c1)
      bitmap.gradientFillRect(0, h - m, w, m, c1, c2, true)
      this._dimmerSprite.setFrame(0, 0, w, h)
    }
  }

  dimColor1() {
    return 'rgba(0, 0, 0, 0.6)'
  }

  dimColor2() {
    return 'rgba(0, 0, 0, 0)'
  }

  canvasToLocalX(x: number) {
    let node = this as PIXI.Container
    while (node) {
      x -= node.x
      node = node.parent
    }
    return x
  }

  canvasToLocalY(y: number) {
    let node = this as PIXI.Container
    while (node) {
      y -= node.y
      node = node.parent
    }
    return y
  }

  reserveFaceImages() {
    global.$gameParty.members().forEach((actor) => {
      ImageManager.reserveFace(actor.faceName())
    })
  }
}
