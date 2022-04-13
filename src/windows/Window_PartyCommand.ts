import {Window_Command} from './Window_Command'
import {Graphics} from '../core/Graphics'
import {TextManager} from '../managers/TextManager'
import {BattleManager} from '../managers/BattleManager'

// Window_PartyCommand
//
// The window for selecting whether to fight or escape on the battle screen.
export class Window_PartyCommand extends Window_Command {

  override initialize() {
    const y = Graphics.boxHeight - this.windowHeight()
    super.initialize(0, y)
    this.openness = 0
    this.deactivate()
    return this
  }

  override windowWidth() {
    return 192
  }

  override numVisibleRows() {
    return 4
  }

  override makeCommandList() {
    this.addCommand(TextManager.fight, 'fight')
    this.addCommand(TextManager.escape, 'escape', BattleManager.canEscape())
  }

  setup() {
    this.clearCommandList()
    this.makeCommandList()
    this.refresh()
    this.select(0)
    this.activate()
    this.open()
  }
}
