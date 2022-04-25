import {global} from '../managers/DataManager'
import {Game_Battler} from './Game_Battler'
import {SoundManager} from '../managers/SoundManager'
import { Game_Action } from './Game_Action'
import {Data_EnemyAction, Data_ItemBase} from '../types/global'

// Game_Enemy
//
// The game object class for an enemy.
export class Game_Enemy extends Game_Battler {

  private _enemyId = 0
  private _letter = ''
  private _plural = false
  private readonly _screenX: number
  private readonly _screenY: number

  constructor(enemyId: number, x: number, y: number) {
    super()
    this._enemyId = enemyId
    this._screenX = x
    this._screenY = y
    this.recoverAll()
  }

  override isEnemy() {
    return true
  }

  override friendsUnit() {
    return global.$gameTroop
  }

  override opponentsUnit() {
    return global.$gameParty
  }

  override index() {
    return global.$gameTroop.members().indexOf(this)
  }

  override isBattleMember() {
    return this.index() >= 0
  }

  enemyId() {
    return this._enemyId
  }

  enemy() {
    return global.$dataEnemies[this._enemyId]
  }

  override traitObjects() {
    return super.traitObjects().concat(this.enemy())
  }

  override paramBase(paramId: number) {
    return this.enemy().params[paramId]
  }

  exp() {
    return this.enemy().exp
  }

  gold() {
    return this.enemy().gold
  }

  makeDropItems() {
    return this.enemy().dropItems.reduce((r, di) => {
      if (di.kind > 0 && Math.random() * di.denominator < this.dropItemRate()) {
        const item = this.itemObject(di.kind, di.dataId)
        return item ? r.concat(item) : r
      } else {
        return r
      }
    }, [] as Data_ItemBase[])
  }

  dropItemRate() {
    return global.$gameParty.hasDropItemDouble() ? 2 : 1
  }

  itemObject(kind: number, dataId: number) {
    if (kind === 1) {
      return global.$dataItems[dataId]
    } else if (kind === 2) {
      return global.$dataWeapons[dataId]
    } else if (kind === 3) {
      return global.$dataArmors[dataId]
    } else {
      return null
    }
  }

  isSpriteVisible() {
    return true
  }

  screenX() {
    return this._screenX
  }

  screenY() {
    return this._screenY
  }

  battlerName() {
    return this.enemy().battlerName
  }

  battlerHue() {
    return this.enemy().battlerHue
  }

  originalName() {
    return this.enemy().name
  }

  name() {
    return this.originalName() + (this._plural ? this._letter : '')
  }

  isLetterEmpty() {
    return this._letter === ''
  }

  setLetter(letter: string) {
    this._letter = letter
  }

  setPlural(plural: boolean) {
    this._plural = plural
  }

  override performActionStart(action: Game_Action) {
    super.performActionStart(action)
    this.requestEffect('whiten')
  }

  override performDamage() {
    SoundManager.playEnemyDamage()
    this.requestEffect('blink')
  }

  override performCollapse() {
    switch (this.collapseType()) {
    case 0:
      this.requestEffect('collapse')
      SoundManager.playEnemyCollapse()
      break
    case 1:
      this.requestEffect('bossCollapse')
      SoundManager.playBossCollapse1()
      break
    case 2:
      this.requestEffect('instantCollapse')
      break
    }
  }

  transform(enemyId: number) {
    const name = this.originalName()
    this._enemyId = enemyId
    if (this.originalName() !== name) {
      this._letter = ''
      this._plural = false
    }
    this.refresh()
    if (this.numActions() > 0) {
      this.makeActions()
    }
  }

  meetsCondition(action: Data_EnemyAction) {
    const param1 = action.conditionParam1
    const param2 = action.conditionParam2
    switch (action.conditionType) {
    case 1:
      return this.meetsTurnCondition(param1, param2)
    case 2:
      return this.meetsHpCondition(param1, param2)
    case 3:
      return this.meetsMpCondition(param1, param2)
    case 4:
      return this.meetsStateCondition(param1)
    case 5:
      return this.meetsPartyLevelCondition(param1)
    case 6:
      return this.meetsSwitchCondition(param1)
    default:
      return true
    }
  }

  meetsTurnCondition(param1: number, param2: number) {
    const n = global.$gameTroop.turnCount()
    if (param2 === 0) {
      return n === param1
    } else {
      return n > 0 && n >= param1 && n % param2 === param1 % param2
    }
  }

  meetsHpCondition(param1: number, param2: number) {
    return this.hpRate() >= param1 && this.hpRate() <= param2
  }

  meetsMpCondition(param1: number, param2: number) {
    return this.mpRate() >= param1 && this.mpRate() <= param2
  }

  meetsStateCondition(param: number) {
    return this.isStateAffected(param)
  }

  meetsPartyLevelCondition(param: number) {
    return global.$gameParty.highestLevel() >= param
  }

  meetsSwitchCondition(param: number) {
    return global.$gameSwitches.value(param)
  }

  isActionValid(action: Data_EnemyAction) {
    return this.meetsCondition(action) && this.canUse(global.$dataSkills[action.skillId])
  }

  selectAction(actionList: Data_EnemyAction[], ratingZero: number) {
    const sum = actionList.reduce((r, a) => r + a.rating - ratingZero, 0)
    if (sum > 0) {
      let value = Math.randomInt(sum)
      for (let i = 0; i < actionList.length; i++) {
        const action = actionList[i]
        value -= action.rating - ratingZero
        if (value < 0) {
          return action
        }
      }
    } else {
      return null
    }
  }

  selectAllActions(actionList: Data_EnemyAction[]) {
    const ratingMax = Math.max.apply(null, actionList.map((a) => a.rating))
    const ratingZero = ratingMax - 3
    actionList = actionList.filter((a) => a.rating > ratingZero)
    for (let i = 0; i < this.numActions(); i++) {
      this.action(i).setEnemyAction(this.selectAction(actionList, ratingZero))
    }
  }

  override makeActions() {
    super.makeActions()
    if (this.numActions() > 0) {
      const actionList = this.enemy().actions.filter((a) => this.isActionValid(a))
      if (actionList.length > 0) {
        this.selectAllActions(actionList)
      }
    }
    this.setActionState('waiting')
  }
}
