import {Window_Command} from './Window_Command'
import {DataManager} from '../managers/DataManager'
import {TextManager} from '../managers/TextManager'
import {global} from '../managers/DataManager'

// Window_MenuCommand
//
// The window for selecting a command on the menu screen.
export class Window_MenuCommand extends Window_Command {

  static _lastCommandSymbol: string | null = null

  static initCommandPosition() {
    this._lastCommandSymbol = null
  }

  override initialize(x: number, y: number) {
    super.initialize(x, y)
    this.selectLast()
    return this
  }

  override windowWidth() {
    return 240
  }

  override numVisibleRows() {
    return this.maxItems()
  }

  override makeCommandList() {
    this.addMainCommands()
    this.addFormationCommand()
    this.addOriginalCommands()
    this.addOptionsCommand()
    this.addSaveCommand()
    this.addGameEndCommand()
  }

  addMainCommands() {
    const enabled = this.areMainCommandsEnabled()
    if (this.needsCommand('item')) {
      this.addCommand(TextManager.item, 'item', enabled)
    }
    if (this.needsCommand('skill')) {
      this.addCommand(TextManager.skill, 'skill', enabled)
    }
    if (this.needsCommand('equip')) {
      this.addCommand(TextManager.equip, 'equip', enabled)
    }
    if (this.needsCommand('status')) {
      this.addCommand(TextManager.status, 'status', enabled)
    }
  }

  addFormationCommand() {
    if (this.needsCommand('formation')) {
      const enabled = this.isFormationEnabled()
      this.addCommand(TextManager.formation, 'formation', enabled)
    }
  }

  addOriginalCommands() {
    // empty
  }

  addOptionsCommand() {
    if (this.needsCommand('options')) {
      const enabled = this.isOptionsEnabled()
      this.addCommand(TextManager.options, 'options', enabled)
    }
  }

  addSaveCommand() {
    if (this.needsCommand('save')) {
      const enabled = this.isSaveEnabled()
      this.addCommand(TextManager.save, 'save', enabled)
    }
  }

  addGameEndCommand() {
    const enabled = this.isGameEndEnabled()
    this.addCommand(TextManager.gameEnd, 'gameEnd', enabled)
  }

  needsCommand(name: string) {
    const flags = global.$dataSystem.menuCommands
    if (flags) {
      switch (name) {
      case 'item':
        return flags[0]
      case 'skill':
        return flags[1]
      case 'equip':
        return flags[2]
      case 'status':
        return flags[3]
      case 'formation':
        return flags[4]
      case 'save':
        return flags[5]
      }
    }
    return true
  }

  areMainCommandsEnabled() {
    return global.$gameParty.exists()
  }

  isFormationEnabled() {
    return global.$gameParty.size() >= 2 && global.$gameSystem.isFormationEnabled()
  }

  isOptionsEnabled() {
    return true
  }

  isSaveEnabled() {
    return !DataManager.isEventTest() && global.$gameSystem.isSaveEnabled()
  }

  isGameEndEnabled() {
    return true
  }

  override processOk() {
    Window_MenuCommand._lastCommandSymbol = this.currentSymbol()
    super.processOk()
  }

  selectLast() {
    this.selectSymbol(Window_MenuCommand._lastCommandSymbol)
  }
}
