import {Window_Command} from './Window_Command'
import {TextManager} from '../managers/TextManager'
import {Graphics} from '../core/Graphics'
import {DataManager} from '../managers/DataManager'

// Window_TitleCommand
//
// The window for selecting New Game/Continue on the title screen.
export class Window_TitleCommand extends Window_Command {

  private static _lastCommandSymbol = null

  static initCommandPosition() {
    this._lastCommandSymbol = null
  }

  override initialize() {
    super.initialize(0, 0)
    this.updatePlacement()
    this.openness = 0
    this.selectLast()
    return this
  }

  override windowWidth() {
    return 240
  }

  updatePlacement() {
    this.x = (Graphics.boxWidth - this.width) / 2
    this.y = Graphics.boxHeight - this.height - 96
  }

  override makeCommandList() {
    this.addCommand(TextManager.newGame, 'newGame')
    this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled())
    this.addCommand(TextManager.options, 'options')
  }

  isContinueEnabled() {
    return DataManager.isAnySavefileExists()
  }

  override processOk() {
    Window_TitleCommand._lastCommandSymbol = this.currentSymbol()
    super.processOk()
  }

  selectLast() {
    if (Window_TitleCommand._lastCommandSymbol) {
      this.selectSymbol(Window_TitleCommand._lastCommandSymbol)
    } else if (this.isContinueEnabled()) {
      this.selectSymbol('continue')
    }
  }
}
