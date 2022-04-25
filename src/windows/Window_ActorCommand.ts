import {Window_Command} from './Window_Command'
import {Graphics} from '../core/Graphics'
import {ConfigManager} from '../managers/ConfigManager'
import {TextManager} from '../managers/TextManager'
import {global} from '../managers/DataManager'
import {Game_Actor} from '../objects/Game_Actor'

// Window_ActorCommand
//
// The window for selecting an actor's action on the battle screen.
export class Window_ActorCommand extends Window_Command {

  private _actor: Game_Actor | null = null

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
    if (this._actor) {
      this.addAttackCommand()
      this.addSkillCommands()
      this.addGuardCommand()
      this.addItemCommand()
    }
  }

  addAttackCommand() {
    this.addCommand(TextManager.attack, 'attack', this._actor!.canAttack())
  }

  addSkillCommands() {
    const skillTypes = this._actor!.addedSkillTypes()
    skillTypes.sort((a, b) => a - b)
    skillTypes.forEach((stypeId) => {
      const name = global.$dataSystem.skillTypes[stypeId]
      this.addCommand(name, 'skill', true, stypeId)
    })
  }

  addGuardCommand() {
    this.addCommand(TextManager.guard, 'guard', this._actor!.canGuard())
  }

  addItemCommand() {
    this.addCommand(TextManager.item, 'item')
  }

  setup(actor: Game_Actor | null) {
    this._actor = actor
    this.clearCommandList()
    this.makeCommandList()
    this.refresh()
    this.selectLast()
    this.activate()
    this.open()
  }

  override processOk() {
    if (this._actor) {
      if (ConfigManager.commandRemember) {
        this._actor.setLastCommandSymbol(this.currentSymbol())
      } else {
        this._actor.setLastCommandSymbol('')
      }
    }
    super.processOk()
  }

  selectLast() {
    this.select(0)
    if (this._actor && ConfigManager.commandRemember) {
      const symbol = this._actor.lastCommandSymbol()
      this.selectSymbol(symbol)
      if (symbol === 'skill') {
        const skill = this._actor.lastBattleSkill()
        if (skill) {
          this.selectExt(skill.stypeId)
        }
      }
    }
  }
}
