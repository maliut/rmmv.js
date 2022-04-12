import {Window_Command} from './Window_Command'
import {Graphics} from '../core/Graphics'
import {TextManager} from '../managers/TextManager'

// Window_GameEnd
//
// The window for selecting "Go to Title" on the game end screen.
export class Window_GameEnd extends Window_Command {

  override initialize() {
    super.initialize(0, 0)
    this.updatePlacement()
    this.openness = 0
    this.open()
  }

  override windowWidth() {
    return 240
  }

  updatePlacement() {
    this.x = (Graphics.boxWidth - this.width) / 2
    this.y = (Graphics.boxHeight - this.height) / 2
  }

  override makeCommandList() {
    this.addCommand(TextManager.toTitle, 'toTitle')
    this.addCommand(TextManager.cancel, 'cancel')
  }
}
