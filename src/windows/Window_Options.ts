import {Window_Command} from './Window_Command'
import {SoundManager} from '../managers/SoundManager'
import {ConfigManager} from '../managers/ConfigManager'
import {TextManager} from '../managers/TextManager'
import {Graphics} from '../core/Graphics'

// Window_Options
//
// The window for changing various settings on the options screen.
export class Window_Options extends Window_Command {

  override initialize() {
    super.initialize(0, 0)
    this.updatePlacement()
    return this
  }

  override windowWidth() {
    return 400
  }

  override windowHeight() {
    return this.fittingHeight(Math.min(this.numVisibleRows(), 12))
  }

  updatePlacement() {
    this.x = (Graphics.boxWidth - this.width) / 2
    this.y = (Graphics.boxHeight - this.height) / 2
  }

  override makeCommandList() {
    this.addGeneralOptions()
    this.addVolumeOptions()
  }

  addGeneralOptions() {
    this.addCommand(TextManager.alwaysDash, 'alwaysDash')
    this.addCommand(TextManager.commandRemember, 'commandRemember')
  }

  addVolumeOptions() {
    this.addCommand(TextManager.bgmVolume, 'bgmVolume')
    this.addCommand(TextManager.bgsVolume, 'bgsVolume')
    this.addCommand(TextManager.meVolume, 'meVolume')
    this.addCommand(TextManager.seVolume, 'seVolume')
  }

  override drawItem(index: number) {
    const rect = this.itemRectForText(index)
    const statusWidth = this.statusWidth()
    const titleWidth = rect.width - statusWidth
    this.resetTextColor()
    this.changePaintOpacity(this.isCommandEnabled(index))
    this.drawText(this.commandName(index), rect.x, rect.y, titleWidth, 'left')
    this.drawText(this.statusText(index), titleWidth, rect.y, statusWidth, 'right')
  }

  statusWidth() {
    return 120
  }

  statusText(index: number) {
    const symbol = this.commandSymbol(index)
    const value = this.getConfigValue(symbol)
    if (this.isVolumeSymbol(symbol)) {
      return this.volumeStatusText(value as number)
    } else {
      return this.booleanStatusText(value as boolean)
    }
  }

  isVolumeSymbol(symbol: string) {
    return symbol.contains('Volume')
  }

  booleanStatusText(value: boolean) {
    return value ? 'ON' : 'OFF'
  }

  volumeStatusText(value: number) {
    return value + '%'
  }

  override processOk() {
    const index = this.index()
    const symbol = this.commandSymbol(index)
    const value = this.getConfigValue(symbol)
    if (this.isVolumeSymbol(symbol)) {
      let _value = value as number
      _value += this.volumeOffset()
      if (_value > 100) {
        _value = 0
      }
      this.changeValue(symbol, _value.clamp(0, 100))
    } else {
      this.changeValue(symbol, !value)
    }
  }

  override cursorRight(wrap = false) {
    const index = this.index()
    const symbol = this.commandSymbol(index)
    const value = this.getConfigValue(symbol)
    if (this.isVolumeSymbol(symbol)) {
      let _value = value as number
      _value += this.volumeOffset()
      this.changeValue(symbol, _value.clamp(0, 100))
    } else {
      this.changeValue(symbol, true)
    }
  }

  override cursorLeft(wrap = false) {
    const index = this.index()
    const symbol = this.commandSymbol(index)
    const value = this.getConfigValue(symbol)
    if (this.isVolumeSymbol(symbol)) {
      let _value = value as number
      _value -= this.volumeOffset()
      this.changeValue(symbol, _value.clamp(0, 100))
    } else {
      this.changeValue(symbol, false)
    }
  }

  volumeOffset() {
    return 20
  }

  changeValue(symbol: string, value: number | boolean) {
    const lastValue = this.getConfigValue(symbol)
    if (lastValue !== value) {
      this.setConfigValue(symbol, value)
      this.redrawItem(this.findSymbol(symbol))
      SoundManager.playCursor()
    }
  }

  getConfigValue(symbol: string): number | boolean {
    return ConfigManager[symbol]
  }

  setConfigValue(symbol: string, volume: number | boolean) {
    ConfigManager[symbol] = volume
  }
}
