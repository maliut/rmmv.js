import {Game_Item} from './Game_Item'
import {global} from '../managers/DataManager'
import {Game_Battler} from './Game_Battler'
import {Game_Actor} from './Game_Actor'
import {assert} from '../utils'
import {Game_Enemy} from './Game_Enemy'
import {Data_Effect, Data_Item, Data_ItemBase, Data_Skill} from '../types/global'

// Game_Action
//
// The game object class for a battle action.
export class Game_Action {

  static EFFECT_RECOVER_HP = 11
  static EFFECT_RECOVER_MP = 12
  static EFFECT_GAIN_TP = 13
  static EFFECT_ADD_STATE = 21
  static EFFECT_REMOVE_STATE = 22
  static EFFECT_ADD_BUFF = 31
  static EFFECT_ADD_DEBUFF = 32
  static EFFECT_REMOVE_BUFF = 33
  static EFFECT_REMOVE_DEBUFF = 34
  static EFFECT_SPECIAL = 41
  static EFFECT_GROW = 42
  static EFFECT_LEARN_SKILL = 43
  static EFFECT_COMMON_EVENT = 44
  static SPECIAL_EFFECT_ESCAPE = 0
  static HITTYPE_CERTAIN = 0
  static HITTYPE_PHYSICAL = 1
  static HITTYPE_MAGICAL = 2

  private readonly _subjectActorId
  private readonly _subjectEnemyIndex
  private readonly _forcing
  private _item = new Game_Item()
  private _targetIndex = -1
  _reflectionTarget?

  constructor(subject: Game_Battler, forcing = false) {
    this._forcing = forcing
    if (subject instanceof Game_Actor) {
      this._subjectActorId = subject.actorId()
      this._subjectEnemyIndex = -1
    } else {
      assert(subject instanceof Game_Enemy)
      this._subjectEnemyIndex = subject.index()
      this._subjectActorId = 0
    }
  }

  clear() {
    this._item = new Game_Item()
    this._targetIndex = -1
  }

  subject() {
    if (this._subjectActorId > 0) {
      return global.$gameActors.actor(this._subjectActorId)!
    } else {
      return global.$gameTroop.members()[this._subjectEnemyIndex]!
    }
  }

  friendsUnit() {
    return this.subject().friendsUnit()
  }

  opponentsUnit() {
    return this.subject().opponentsUnit()
  }

  setEnemyAction(action) {
    if (action) {
      this.setSkill(action.skillId)
    } else {
      this.clear()
    }
  }

  setAttack() {
    this.setSkill(this.subject().attackSkillId())
  }

  setGuard() {
    this.setSkill(this.subject().guardSkillId())
  }

  setSkill(skillId: number) {
    this._item.setObject(global.$dataSkills[skillId])
  }

  setItem(itemId: number) {
    this._item.setObject(global.$dataItems[itemId])
  }

  setItemObject(object: Data_ItemBase | null) {
    this._item.setObject(object)
  }

  setTarget(targetIndex: number) {
    this._targetIndex = targetIndex
  }

  item() {
    return this._item.object()
  }

  isSkill() {
    return this._item.isSkill()
  }

  isItem() {
    return this._item.isItem()
  }

  numRepeats() {
    let repeats = (this.item() as Data_Skill).repeats
    if (this.isAttack()) {
      repeats += this.subject().attackTimesAdd()
    }
    return Math.floor(repeats)
  }

  checkItemScope(list) {
    return list.contains((this.item() as Data_Item).scope)
  }

  isForOpponent() {
    return this.checkItemScope([1, 2, 3, 4, 5, 6])
  }

  isForFriend() {
    return this.checkItemScope([7, 8, 9, 10, 11])
  }

  isForDeadFriend() {
    return this.checkItemScope([9, 10])
  }

  isForUser() {
    return this.checkItemScope([11])
  }

  isForOne() {
    return this.checkItemScope([1, 3, 7, 9, 11])
  }

  isForRandom() {
    return this.checkItemScope([3, 4, 5, 6])
  }

  isForAll() {
    return this.checkItemScope([2, 8, 10])
  }

  needsSelection() {
    return this.checkItemScope([1, 7, 9])
  }

  numTargets() {
    return this.isForRandom() ? (this.item() as Data_Skill).scope - 2 : 0
  }

  checkDamageType(list) {
    return list.contains((this.item() as Data_Skill).damage.type)
  }

  isHpEffect() {
    return this.checkDamageType([1, 3, 5])
  }

  isMpEffect() {
    return this.checkDamageType([2, 4, 6])
  }

  isDamage() {
    return this.checkDamageType([1, 2])
  }

  isRecover() {
    return this.checkDamageType([3, 4])
  }

  isDrain() {
    return this.checkDamageType([5, 6])
  }

  isHpRecover() {
    return this.checkDamageType([3])
  }

  isMpRecover() {
    return this.checkDamageType([4])
  }

  isCertainHit() {
    return (this.item() as Data_Skill).hitType === Game_Action.HITTYPE_CERTAIN
  }

  isPhysical() {
    return (this.item() as Data_Skill).hitType === Game_Action.HITTYPE_PHYSICAL
  }

  isMagical() {
    return (this.item() as Data_Skill).hitType === Game_Action.HITTYPE_MAGICAL
  }

  isAttack() {
    return this.item() === global.$dataSkills[this.subject().attackSkillId()]
  }

  isGuard() {
    return this.item() === global.$dataSkills[this.subject().guardSkillId()]
  }

  isMagicSkill() {
    if (this.isSkill()) {
      return global.$dataSystem.magicSkills.contains((this.item() as Data_Skill).stypeId)
    } else {
      return false
    }
  }

  decideRandomTarget() {
    let target
    if (this.isForDeadFriend()) {
      target = this.friendsUnit().randomDeadTarget()
    } else if (this.isForFriend()) {
      target = this.friendsUnit().randomTarget()
    } else {
      target = this.opponentsUnit().randomTarget()
    }
    if (target) {
      this._targetIndex = target.index()
    } else {
      this.clear()
    }
  }

  setConfusion() {
    this.setAttack()
  }

  prepare() {
    if (this.subject().isConfused() && !this._forcing) {
      this.setConfusion()
    }
  }

  isValid() {
    return (this._forcing && this.item()) || this.subject().canUse(this.item())
  }

  speed() {
    const agi = this.subject().agi
    let speed = agi + Math.randomInt(Math.floor(5 + agi / 4))
    if (this.item()) {
      speed += (this.item() as Data_Skill).speed
    }
    if (this.isAttack()) {
      speed += this.subject().attackSpeed()
    }
    return speed
  }

  makeTargets() {
    let targets: Game_Battler[] = []
    if (!this._forcing && this.subject().isConfused()) {
      targets = [this.confusionTarget()]
    } else if (this.isForOpponent()) {
      targets = this.targetsForOpponents()
    } else if (this.isForFriend()) {
      targets = this.targetsForFriends()
    }
    return this.repeatTargets(targets)
  }

  repeatTargets(targets: Game_Battler[]) {
    const repeatedTargets: Game_Battler[] = []
    const repeats = this.numRepeats()
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      if (target) {
        for (let j = 0; j < repeats; j++) {
          repeatedTargets.push(target)
        }
      }
    }
    return repeatedTargets
  }

  confusionTarget() {
    switch (this.subject().confusionLevel()) {
    case 1:
      return this.opponentsUnit().randomTarget()
    case 2:
      if (Math.randomInt(2) === 0) {
        return this.opponentsUnit().randomTarget()
      }
      return this.friendsUnit().randomTarget()
    default:
      return this.friendsUnit().randomTarget()
    }
  }

  targetsForOpponents() {
    let targets: Game_Battler[] = []
    const unit = this.opponentsUnit()
    if (this.isForRandom()) {
      for (let i = 0; i < this.numTargets(); i++) {
        targets.push(unit.randomTarget())
      }
    } else if (this.isForOne()) {
      if (this._targetIndex < 0) {
        targets.push(unit.randomTarget())
      } else {
        targets.push(unit.smoothTarget(this._targetIndex))
      }
    } else {
      targets = unit.aliveMembers()
    }
    return targets
  }

  targetsForFriends() {
    let targets: Game_Battler[] = []
    const unit = this.friendsUnit()
    if (this.isForUser()) {
      return [this.subject()]
    } else if (this.isForDeadFriend()) {
      if (this.isForOne()) {
        targets.push(unit.smoothDeadTarget(this._targetIndex))
      } else {
        targets = unit.deadMembers()
      }
    } else if (this.isForOne()) {
      if (this._targetIndex < 0) {
        targets.push(unit.randomTarget())
      } else {
        targets.push(unit.smoothTarget(this._targetIndex))
      }
    } else {
      targets = unit.aliveMembers()
    }
    return targets
  }

  evaluate() {
    let value = 0
    this.itemTargetCandidates().forEach((target) => {
      const targetValue = this.evaluateWithTarget(target)
      if (this.isForAll()) {
        value += targetValue
      } else if (targetValue > value) {
        value = targetValue
        this._targetIndex = target.index()
      }
    })
    value *= this.numRepeats()
    if (value > 0) {
      value += Math.random()
    }
    return value
  }

  itemTargetCandidates() {
    if (!this.isValid()) {
      return []
    } else if (this.isForOpponent()) {
      return this.opponentsUnit().aliveMembers()
    } else if (this.isForUser()) {
      return [this.subject()]
    } else if (this.isForDeadFriend()) {
      return this.friendsUnit().deadMembers()
    } else {
      return this.friendsUnit().aliveMembers()
    }
  }

  evaluateWithTarget(target: Game_Battler) {
    if (this.isHpEffect()) {
      const value = this.makeDamageValue(target, false)
      if (this.isForOpponent()) {
        return value / Math.max(target.hp, 1)
      } else {
        const recovery = Math.min(-value, target.mhp - target.hp)
        return recovery / target.mhp
      }
    }
    return 0
  }

  testApply(target: Game_Battler) {
    return (this.isForDeadFriend() === target.isDead() &&
      (global.$gameParty.inBattle() || this.isForOpponent() ||
        (this.isHpRecover() && target.hp < target.mhp) ||
        (this.isMpRecover() && target.mp < target.mmp) ||
        (this.hasItemAnyValidEffects(target))))
  }

  hasItemAnyValidEffects(target: Game_Battler) {
    return (this.item() as Data_Skill | Data_Item).effects.some((effect) => {
      return this.testItemEffect(target, effect)
    })
  }

  testItemEffect(target: Game_Battler, effect: Data_Effect) {
    switch (effect.code) {
    case Game_Action.EFFECT_RECOVER_HP:
      return target.hp < target.mhp || effect.value1 < 0 || effect.value2 < 0
    case Game_Action.EFFECT_RECOVER_MP:
      return target.mp < target.mmp || effect.value1 < 0 || effect.value2 < 0
    case Game_Action.EFFECT_ADD_STATE:
      return !target.isStateAffected(effect.dataId)
    case Game_Action.EFFECT_REMOVE_STATE:
      return target.isStateAffected(effect.dataId)
    case Game_Action.EFFECT_ADD_BUFF:
      return !target.isMaxBuffAffected(effect.dataId)
    case Game_Action.EFFECT_ADD_DEBUFF:
      return !target.isMaxDebuffAffected(effect.dataId)
    case Game_Action.EFFECT_REMOVE_BUFF:
      return target.isBuffAffected(effect.dataId)
    case Game_Action.EFFECT_REMOVE_DEBUFF:
      return target.isDebuffAffected(effect.dataId)
    case Game_Action.EFFECT_LEARN_SKILL:
      return (target instanceof Game_Actor) && !target.isLearnedSkill(effect.dataId)
    default:
      return true
    }
  }

  itemCnt(target: Game_Battler) {
    if (this.isPhysical() && target.canMove()) {
      return target.cnt
    } else {
      return 0
    }
  }

  itemMrf(target: Game_Battler) {
    if (this.isMagical()) {
      return target.mrf
    } else {
      return 0
    }
  }

  itemHit(target: Game_Battler) {
    if (this.isPhysical()) {
      return (this.item() as Data_Skill | Data_Item).successRate * 0.01 * this.subject().hit
    } else {
      return (this.item() as Data_Skill | Data_Item).successRate * 0.01
    }
  }

  itemEva(target: Game_Battler) {
    if (this.isPhysical()) {
      return target.eva
    } else if (this.isMagical()) {
      return target.mev
    } else {
      return 0
    }
  }

  itemCri(target: Game_Battler) {
    return (this.item() as Data_Skill | Data_Item).damage.critical ? this.subject().cri * (1 - target.cev) : 0
  }

  apply(target: Game_Battler) {
    const result = target.result()
    this.subject().clearResult()
    result.clear()
    result.used = this.testApply(target)
    result.missed = (result.used && Math.random() >= this.itemHit(target))
    result.evaded = (!result.missed && Math.random() < this.itemEva(target))
    result.physical = this.isPhysical()
    result.drain = this.isDrain()
    if (result.isHit()) {
      if ((this.item() as Data_Skill | Data_Item).damage.type > 0) {
        result.critical = (Math.random() < this.itemCri(target))
        const value = this.makeDamageValue(target, result.critical)
        this.executeDamage(target, value)
      }
      (this.item() as Data_Skill | Data_Item).effects.forEach((effect) => {
        this.applyItemEffect(target, effect)
      })
      this.applyItemUserEffect(target)
    }
  }

  makeDamageValue(target: Game_Battler, critical = false) {
    const item = this.item() as Data_Skill | Data_Item
    const baseValue = this.evalDamageFormula(target)
    let value = baseValue * this.calcElementRate(target)
    if (this.isPhysical()) {
      value *= target.pdr
    }
    if (this.isMagical()) {
      value *= target.mdr
    }
    if (baseValue < 0) {
      value *= target.rec
    }
    if (critical) {
      value = this.applyCritical(value)
    }
    value = this.applyVariance(value, item.damage.variance)
    value = this.applyGuard(value, target)
    value = Math.round(value)
    return value
  }

  evalDamageFormula(target: Game_Battler) {
    try {
      const item = this.item() as Data_Skill | Data_Item
      // const a = this.subject()
      // const b = target
      // const v = global.$gameVariables._data
      const sign = ([3, 4].contains(item.damage.type) ? -1 : 1)
      let value = Math.max(eval(item.damage.formula), 0) * sign
      if (isNaN(value)) value = 0
      return value
    } catch (e) {
      return 0
    }
  }

  calcElementRate(target: Game_Battler) {
    const item = this.item() as Data_Skill | Data_Item
    if (item.damage.elementId < 0) {
      return this.elementsMaxRate(target, this.subject().attackElements())
    } else {
      return target.elementRate(item.damage.elementId)
    }
  }

  elementsMaxRate(target: Game_Battler, elements: number[]) {
    if (elements.length > 0) {
      return Math.max.apply(null, elements.map((elementId) => {
        return target.elementRate(elementId)
      }))
    } else {
      return 1
    }
  }

  applyCritical(damage: number) {
    return damage * 3
  }

  applyVariance(damage: number, variance: number) {
    const amp = Math.floor(Math.max(Math.abs(damage) * variance / 100, 0))
    const v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp
    return damage >= 0 ? damage + v : damage - v
  }

  applyGuard(damage: number, target: Game_Battler) {
    return damage / (damage > 0 && target.isGuard() ? 2 * target.grd : 1)
  }

  executeDamage(target: Game_Battler, value: number) {
    const result = target.result()
    if (value === 0) {
      result.critical = false
    }
    if (this.isHpEffect()) {
      this.executeHpDamage(target, value)
    }
    if (this.isMpEffect()) {
      this.executeMpDamage(target, value)
    }
  }

  executeHpDamage(target: Game_Battler, value: number) {
    if (this.isDrain()) {
      value = Math.min(target.hp, value)
    }
    this.makeSuccess(target)
    target.gainHp(-value)
    if (value > 0) {
      target.onDamage(value)
    }
    this.gainDrainedHp(value)
  }

  executeMpDamage(target: Game_Battler, value: number) {
    if (!this.isMpRecover()) {
      value = Math.min(target.mp, value)
    }
    if (value !== 0) {
      this.makeSuccess(target)
    }
    target.gainMp(-value)
    this.gainDrainedMp(value)
  }

  gainDrainedHp(value: number) {
    if (this.isDrain()) {
      let gainTarget = this.subject()
      if (this._reflectionTarget !== undefined) {
        gainTarget = this._reflectionTarget
      }
      gainTarget.gainHp(value)
    }
  }

  gainDrainedMp(value: number) {
    if (this.isDrain()) {
      let gainTarget = this.subject()
      if (this._reflectionTarget !== undefined) {
        gainTarget = this._reflectionTarget
      }
      gainTarget.gainMp(value)
    }
  }

  applyItemEffect(target: Game_Battler, effect: Data_Effect) {
    switch (effect.code) {
    case Game_Action.EFFECT_RECOVER_HP:
      this.itemEffectRecoverHp(target, effect)
      break
    case Game_Action.EFFECT_RECOVER_MP:
      this.itemEffectRecoverMp(target, effect)
      break
    case Game_Action.EFFECT_GAIN_TP:
      this.itemEffectGainTp(target, effect)
      break
    case Game_Action.EFFECT_ADD_STATE:
      this.itemEffectAddState(target, effect)
      break
    case Game_Action.EFFECT_REMOVE_STATE:
      this.itemEffectRemoveState(target, effect)
      break
    case Game_Action.EFFECT_ADD_BUFF:
      this.itemEffectAddBuff(target, effect)
      break
    case Game_Action.EFFECT_ADD_DEBUFF:
      this.itemEffectAddDebuff(target, effect)
      break
    case Game_Action.EFFECT_REMOVE_BUFF:
      this.itemEffectRemoveBuff(target, effect)
      break
    case Game_Action.EFFECT_REMOVE_DEBUFF:
      this.itemEffectRemoveDebuff(target, effect)
      break
    case Game_Action.EFFECT_SPECIAL:
      this.itemEffectSpecial(target, effect)
      break
    case Game_Action.EFFECT_GROW:
      this.itemEffectGrow(target, effect)
      break
    case Game_Action.EFFECT_LEARN_SKILL:
      this.itemEffectLearnSkill(target, effect)
      break
    case Game_Action.EFFECT_COMMON_EVENT:
      this.itemEffectCommonEvent(target, effect)
      break
    }
  }

  itemEffectRecoverHp(target: Game_Battler, effect: Data_Effect) {
    let value = (target.mhp * effect.value1 + effect.value2) * target.rec
    if (this.isItem()) {
      value *= this.subject().pha
    }
    value = Math.floor(value)
    if (value !== 0) {
      target.gainHp(value)
      this.makeSuccess(target)
    }
  }

  itemEffectRecoverMp(target: Game_Battler, effect: Data_Effect) {
    let value = (target.mmp * effect.value1 + effect.value2) * target.rec
    if (this.isItem()) {
      value *= this.subject().pha
    }
    value = Math.floor(value)
    if (value !== 0) {
      target.gainMp(value)
      this.makeSuccess(target)
    }
  }

  itemEffectGainTp(target: Game_Battler, effect: Data_Effect) {
    const value = Math.floor(effect.value1)
    if (value !== 0) {
      target.gainTp(value)
      this.makeSuccess(target)
    }
  }

  itemEffectAddState(target: Game_Battler, effect: Data_Effect) {
    if (effect.dataId === 0) {
      this.itemEffectAddAttackState(target, effect)
    } else {
      this.itemEffectAddNormalState(target, effect)
    }
  }

  itemEffectAddAttackState(target: Game_Battler, effect: Data_Effect) {
    this.subject().attackStates().forEach((stateId) => {
      let chance = effect.value1
      chance *= target.stateRate(stateId)
      chance *= this.subject().attackStatesRate(stateId)
      chance *= this.lukEffectRate(target)
      if (Math.random() < chance) {
        target.addState(stateId)
        this.makeSuccess(target)
      }
    }, target)
  }

  itemEffectAddNormalState(target: Game_Battler, effect: Data_Effect) {
    let chance = effect.value1
    if (!this.isCertainHit()) {
      chance *= target.stateRate(effect.dataId)
      chance *= this.lukEffectRate(target)
    }
    if (Math.random() < chance) {
      target.addState(effect.dataId)
      this.makeSuccess(target)
    }
  }

  itemEffectRemoveState(target: Game_Battler, effect: Data_Effect) {
    const chance = effect.value1
    if (Math.random() < chance) {
      target.removeState(effect.dataId)
      this.makeSuccess(target)
    }
  }

  itemEffectAddBuff(target: Game_Battler, effect: Data_Effect) {
    target.addBuff(effect.dataId, effect.value1)
    this.makeSuccess(target)
  }

  itemEffectAddDebuff(target: Game_Battler, effect: Data_Effect) {
    const chance = target.debuffRate(effect.dataId) * this.lukEffectRate(target)
    if (Math.random() < chance) {
      target.addDebuff(effect.dataId, effect.value1)
      this.makeSuccess(target)
    }
  }

  itemEffectRemoveBuff(target: Game_Battler, effect: Data_Effect) {
    if (target.isBuffAffected(effect.dataId)) {
      target.removeBuff(effect.dataId)
      this.makeSuccess(target)
    }
  }

  itemEffectRemoveDebuff(target: Game_Battler, effect: Data_Effect) {
    if (target.isDebuffAffected(effect.dataId)) {
      target.removeBuff(effect.dataId)
      this.makeSuccess(target)
    }
  }

  itemEffectSpecial(target: Game_Battler, effect: Data_Effect) {
    if (effect.dataId === Game_Action.SPECIAL_EFFECT_ESCAPE) {
      target.escape()
      this.makeSuccess(target)
    }
  }

  itemEffectGrow(target: Game_Battler, effect: Data_Effect) {
    target.addParam(effect.dataId, Math.floor(effect.value1))
    this.makeSuccess(target)
  }

  itemEffectLearnSkill(target: Game_Battler, effect: Data_Effect) {
    if (target instanceof Game_Actor) {
      target.learnSkill(effect.dataId)
      this.makeSuccess(target)
    }
  }

  itemEffectCommonEvent(target: Game_Battler, effect: Data_Effect) {
    // empty
  }

  makeSuccess(target: Game_Battler) {
    target.result().success = true
  }

  applyItemUserEffect(target: Game_Battler) {
    const value = Math.floor((this.item() as Data_Item).tpGain * this.subject().tcr)
    this.subject().gainSilentTp(value)
  }

  lukEffectRate(target: Game_Battler) {
    return Math.max(1.0 + (this.subject().luk - target.luk) * 0.001, 0.0)
  }

  applyGlobal() {
    (this.item() as Data_Item).effects.forEach((effect) => {
      if (effect.code === Game_Action.EFFECT_COMMON_EVENT) {
        global.$gameTemp.reserveCommonEvent(effect.dataId)
      }
    })
  }
}
