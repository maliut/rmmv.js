import {Window_HorzCommand} from './Window_HorzCommand'
import {TextManager} from '../managers/TextManager'

// Window_EquipCommand
//
// The window for selecting a command on the equipment screen.
export class Window_EquipCommand extends Window_HorzCommand {

  private readonly _windowWidth

  constructor(width) {
    super()
    this._windowWidth = width
  }

  override windowWidth() {
    return this._windowWidth
  }

  override maxCols() {
    return 3
  }

  override makeCommandList() {
    this.addCommand(TextManager.equip2, 'equip')
    this.addCommand(TextManager.optimize, 'optimize')
    this.addCommand(TextManager.clear, 'clear')
  }
}
