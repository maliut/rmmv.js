import {DataManager, global} from '../managers/DataManager'
import {Data_Armor, Data_Item, Data_ItemBase, Data_Skill, Data_Trait, Data_Weapon} from '../types/global'
import {Game_Unit} from './Game_Unit'

// Game_BattlerBase
//
// The superclass of Game_Battler. It mainly contains parameters calculation.
export class Game_BattlerBase {
  static TRAIT_ELEMENT_RATE = 11
  static TRAIT_DEBUFF_RATE = 12
  static TRAIT_STATE_RATE = 13
  static TRAIT_STATE_RESIST = 14
  static TRAIT_PARAM = 21
  static TRAIT_XPARAM = 22
  static TRAIT_SPARAM = 23
  static TRAIT_ATTACK_ELEMENT = 31
  static TRAIT_ATTACK_STATE = 32
  static TRAIT_ATTACK_SPEED = 33
  static TRAIT_ATTACK_TIMES = 34
  static TRAIT_STYPE_ADD = 41
  static TRAIT_STYPE_SEAL = 42
  static TRAIT_SKILL_ADD = 43
  static TRAIT_SKILL_SEAL = 44
  static TRAIT_EQUIP_WTYPE = 51
  static TRAIT_EQUIP_ATYPE = 52
  static TRAIT_EQUIP_LOCK = 53
  static TRAIT_EQUIP_SEAL = 54
  static TRAIT_SLOT_TYPE = 55
  static TRAIT_ACTION_PLUS = 61
  static TRAIT_SPECIAL_FLAG = 62
  static TRAIT_COLLAPSE_TYPE = 63
  static TRAIT_PARTY_ABILITY = 64
  static FLAG_ID_AUTO_BATTLE = 0
  static FLAG_ID_GUARD = 1
  static FLAG_ID_SUBSTITUTE = 2
  static FLAG_ID_PRESERVE_TP = 3
  static ICON_BUFF_START = 32
  static ICON_DEBUFF_START = 48

  private _hp = 1
  private _mp = 0
  private _tp = 0
  private _hidden = false
  private _paramPlus = [0, 0, 0, 0, 0, 0, 0, 0]
  private _states: number[] = []
  private _stateTurns: Record<number, number> = {}
  private _buffs = [0, 0, 0, 0, 0, 0, 0, 0]
  private _buffTurns = [0, 0, 0, 0, 0, 0, 0, 0]


  // Hit Points
  get hp() {
    return this._hp
  }

  // Magic Points
  get mp() {
    return this._mp
  }

  // Tactical Points
  get tp() {
    return this._tp
  }

  // Maximum Hit Points
  get mhp() {
    return this.param(0)
  }

  // Maximum Magic Points
  get mmp() {
    return this.param(1)
  }

  // ATtacK power
  get atk() {
    return this.param(2)
  }

  // DEFense power
  get def() {
    return this.param(3)
  }

  // Magic ATtack power
  get mat() {
    return this.param(4)
  }

  // Magic DeFense power
  get mdf() {
    return this.param(5)
  }

  // AGIlity
  get agi() {
    return this.param(6)
  }

  // LUcK
  get luk() {
    return this.param(7)
  }

  // HIT rate
  get hit() {
    return this.xparam(0)
  }

  // EVAsion rate
  get eva() {
    return this.xparam(1)
  }

  // CRItical rate
  get cri() {
    return this.xparam(2)
  }

  // Critical EVasion rate
  get cev() {
    return this.xparam(3)
  }

  // Magic EVasion rate
  get mev() {
    return this.xparam(4)
  }

  // Magic ReFlection rate
  get mrf() {
    return this.xparam(5)
  }

  // CouNTer attack rate
  get cnt() {
    return this.xparam(6)
  }

  // Hp ReGeneration rate
  get hrg() {
    return this.xparam(7)
  }

  // Mp ReGeneration rate
  get mrg() {
    return this.xparam(8)
  }

  // Tp ReGeneration rate
  get trg() {
    return this.xparam(9)
  }

  // TarGet Rate
  get tgr() {
    return this.sparam(0)
  }

  // GuaRD effect rate
  get grd() {
    return this.sparam(1)
  }

  // RECovery effect rate
  get rec() {
    return this.sparam(2)
  }

  // PHArmacology
  get pha() {
    return this.sparam(3)
  }

  // Mp Cost Rate
  get mcr() {
    return this.sparam(4)
  }

  // Tp Charge Rate
  get tcr() {
    return this.sparam(5)
  }

  // Physical Damage Rate
  get pdr() {
    return this.sparam(6)
  }

  // Magical Damage Rate
  get mdr() {
    return this.sparam(7)
  }

  // Floor Damage Rate
  get fdr() {
    return this.sparam(8)
  }

  // EXperience Rate
  get exr() {
    return this.sparam(9)
  }

  clearParamPlus() {
    this._paramPlus = [0, 0, 0, 0, 0, 0, 0, 0]
  }

  clearStates() {
    this._states = []
    this._stateTurns = {}
  }

  eraseState(stateId: number) {
    const index = this._states.indexOf(stateId)
    if (index >= 0) {
      this._states.splice(index, 1)
    }
    delete this._stateTurns[stateId]
  }

  isStateAffected(stateId: number) {
    return this._states.contains(stateId)
  }

  isDeathStateAffected() {
    return this.isStateAffected(this.deathStateId())
  }

  deathStateId() {
    return 1
  }

  resetStateCounts(stateId: number) {
    const state = global.$dataStates[stateId]
    const variance = 1 + Math.max(state.maxTurns - state.minTurns, 0)
    this._stateTurns[stateId] = state.minTurns + Math.randomInt(variance)
  }

  isStateExpired(stateId: number) {
    return this._stateTurns[stateId] === 0
  }

  updateStateTurns() {
    this._states.forEach((stateId) => {
      if (this._stateTurns[stateId] > 0) {
        this._stateTurns[stateId]--
      }
    })
  }

  clearBuffs() {
    this._buffs = [0, 0, 0, 0, 0, 0, 0, 0]
    this._buffTurns = [0, 0, 0, 0, 0, 0, 0, 0]
  }

  eraseBuff(paramId: number) {
    this._buffs[paramId] = 0
    this._buffTurns[paramId] = 0
  }

  buffLength() {
    return this._buffs.length
  }

  buff(paramId: number) {
    return this._buffs[paramId]
  }

  isBuffAffected(paramId: number) {
    return this._buffs[paramId] > 0
  }

  isDebuffAffected(paramId: number) {
    return this._buffs[paramId] < 0
  }

  isBuffOrDebuffAffected(paramId: number) {
    return this._buffs[paramId] !== 0
  }

  isMaxBuffAffected(paramId: number) {
    return this._buffs[paramId] === 2
  }

  isMaxDebuffAffected(paramId: number) {
    return this._buffs[paramId] === -2
  }

  increaseBuff(paramId: number) {
    if (!this.isMaxBuffAffected(paramId)) {
      this._buffs[paramId]++
    }
  }

  decreaseBuff(paramId: number) {
    if (!this.isMaxDebuffAffected(paramId)) {
      this._buffs[paramId]--
    }
  }

  overwriteBuffTurns(paramId: number, turns: number) {
    if (this._buffTurns[paramId] < turns) {
      this._buffTurns[paramId] = turns
    }
  }

  isBuffExpired(paramId: number) {
    return this._buffTurns[paramId] === 0
  }

  updateBuffTurns() {
    for (let i = 0; i < this._buffTurns.length; i++) {
      if (this._buffTurns[i] > 0) {
        this._buffTurns[i]--
      }
    }
  }

  die() {
    this._hp = 0
    this.clearStates()
    this.clearBuffs()
  }

  revive() {
    if (this._hp === 0) {
      this._hp = 1
    }
  }

  states() {
    return this._states.map((id) => global.$dataStates[id])
  }

  stateIcons() {
    return this.states().map((state) => state.iconIndex).filter((iconIndex) => iconIndex > 0)
  }

  buffIcons() {
    const icons: number[] = []
    for (let i = 0; i < this._buffs.length; i++) {
      if (this._buffs[i] !== 0) {
        icons.push(this.buffIconIndex(this._buffs[i], i))
      }
    }
    return icons
  }

  buffIconIndex(buffLevel: number, paramId: number) {
    if (buffLevel > 0) {
      return Game_BattlerBase.ICON_BUFF_START + (buffLevel - 1) * 8 + paramId
    } else if (buffLevel < 0) {
      return Game_BattlerBase.ICON_DEBUFF_START + (-buffLevel - 1) * 8 + paramId
    } else {
      return 0
    }
  }

  allIcons() {
    return this.stateIcons().concat(this.buffIcons())
  }

  traitObjects(): { traits: Data_Trait[] }[] {
    // Returns an array of the all objects having traits. States only here.
    return this.states()
  }

  allTraits() {
    return this.traitObjects().reduce(function (r, obj) {
      return r.concat(obj.traits)
    }, [] as Data_Trait[])
  }

  traits(code: number) {
    return this.allTraits().filter((trait) => {
      return trait.code === code
    })
  }

  traitsWithId(code: number, id: number) {
    return this.allTraits().filter((trait) => {
      return trait.code === code && trait.dataId === id
    })
  }

  traitsPi(code: number, id: number) {
    return this.traitsWithId(code, id).reduce((r, trait) => r * trait.value, 1)
  }

  traitsSum(code: number, id: number) {
    return this.traitsWithId(code, id).reduce((r, trait) => r + trait.value, 0)
  }

  traitsSumAll(code: number) {
    return this.traits(code).reduce((r, trait) => r + trait.value, 0)
  }

  traitsSet(code: number) {
    return this.traits(code).reduce((r, trait) => {
      return r.concat(trait.dataId)
    }, [] as number[])
  }

  paramBase(paramId: number) {
    return 0
  }

  paramPlus(paramId: number) {
    return this._paramPlus[paramId]
  }

  paramMin(paramId: number) {
    if (paramId === 1) {
      return 0   // MMP
    } else {
      return 1
    }
  }

  paramMax(paramId: number) {
    if (paramId === 0) {
      return 999999  // MHP
    } else if (paramId === 1) {
      return 9999    // MMP
    } else {
      return 999
    }
  }

  paramRate(paramId: number) {
    return this.traitsPi(Game_BattlerBase.TRAIT_PARAM, paramId)
  }

  paramBuffRate(paramId: number) {
    return this._buffs[paramId] * 0.25 + 1.0
  }

  param(paramId: number) {
    let value = this.paramBase(paramId) + this.paramPlus(paramId)
    value *= this.paramRate(paramId) * this.paramBuffRate(paramId)
    const maxValue = this.paramMax(paramId)
    const minValue = this.paramMin(paramId)
    return Math.round(value.clamp(minValue, maxValue))
  }

  xparam(xparamId: number) {
    return this.traitsSum(Game_BattlerBase.TRAIT_XPARAM, xparamId)
  }

  sparam(sparamId: number) {
    return this.traitsPi(Game_BattlerBase.TRAIT_SPARAM, sparamId)
  }

  elementRate(elementId: number) {
    return this.traitsPi(Game_BattlerBase.TRAIT_ELEMENT_RATE, elementId)
  }

  debuffRate(paramId: number) {
    return this.traitsPi(Game_BattlerBase.TRAIT_DEBUFF_RATE, paramId)
  }

  stateRate(stateId: number) {
    return this.traitsPi(Game_BattlerBase.TRAIT_STATE_RATE, stateId)
  }

  stateResistSet() {
    return this.traitsSet(Game_BattlerBase.TRAIT_STATE_RESIST)
  }

  isStateResist(stateId: number) {
    return this.stateResistSet().contains(stateId)
  }

  attackElements() {
    return this.traitsSet(Game_BattlerBase.TRAIT_ATTACK_ELEMENT)
  }

  attackStates() {
    return this.traitsSet(Game_BattlerBase.TRAIT_ATTACK_STATE)
  }

  attackStatesRate(stateId: number) {
    return this.traitsSum(Game_BattlerBase.TRAIT_ATTACK_STATE, stateId)
  }

  attackSpeed() {
    return this.traitsSumAll(Game_BattlerBase.TRAIT_ATTACK_SPEED)
  }

  attackTimesAdd() {
    return Math.max(this.traitsSumAll(Game_BattlerBase.TRAIT_ATTACK_TIMES), 0)
  }

  addedSkillTypes() {
    return this.traitsSet(Game_BattlerBase.TRAIT_STYPE_ADD)
  }

  isSkillTypeSealed(stypeId: number) {
    return this.traitsSet(Game_BattlerBase.TRAIT_STYPE_SEAL).contains(stypeId)
  }

  addedSkills() {
    return this.traitsSet(Game_BattlerBase.TRAIT_SKILL_ADD)
  }

  isSkillSealed(skillId: number) {
    return this.traitsSet(Game_BattlerBase.TRAIT_SKILL_SEAL).contains(skillId)
  }

  isEquipWtypeOk(wtypeId: number) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_WTYPE).contains(wtypeId)
  }

  isEquipAtypeOk(atypeId: number) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_ATYPE).contains(atypeId)
  }

  isEquipTypeLocked(etypeId: number) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_LOCK).contains(etypeId)
  }

  isEquipTypeSealed(etypeId: number) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_SEAL).contains(etypeId)
  }

  slotType() {
    const set = this.traitsSet(Game_BattlerBase.TRAIT_SLOT_TYPE)
    return set.length > 0 ? Math.max.apply(null, set) : 0
  }

  isDualWield() {
    return this.slotType() === 1
  }

  actionPlusSet() {
    return this.traits(Game_BattlerBase.TRAIT_ACTION_PLUS).map((trait) => trait.value)
  }

  specialFlag(flagId: number) {
    return this.traits(Game_BattlerBase.TRAIT_SPECIAL_FLAG).some((trait) => trait.dataId === flagId)
  }

  collapseType() {
    const set = this.traitsSet(Game_BattlerBase.TRAIT_COLLAPSE_TYPE)
    return set.length > 0 ? Math.max.apply(null, set) : 0
  }

  partyAbility(abilityId: number) {
    return this.traits(Game_BattlerBase.TRAIT_PARTY_ABILITY).some((trait) => trait.dataId === abilityId)
  }

  isAutoBattle() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_AUTO_BATTLE)
  }

  isGuard() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_GUARD) && this.canMove()
  }

  isSubstitute() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_SUBSTITUTE) && this.canMove()
  }

  isPreserveTp() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_PRESERVE_TP)
  }

  addParam(paramId: number, value: number) {
    this._paramPlus[paramId] += value
    this.refresh()
  }

  setHp(hp: number) {
    this._hp = hp
    this.refresh()
  }

  setMp(mp: number) {
    this._mp = mp
    this.refresh()
  }

  setTp(tp: number) {
    this._tp = tp
    this.refresh()
  }

  maxTp() {
    return 100
  }

  refresh() {
    this.stateResistSet().forEach((stateId) => {
      this.eraseState(stateId)
    })
    this._hp = this._hp.clamp(0, this.mhp)
    this._mp = this._mp.clamp(0, this.mmp)
    this._tp = this._tp.clamp(0, this.maxTp())
  }

  recoverAll() {
    this.clearStates()
    this._hp = this.mhp
    this._mp = this.mmp
  }

  hpRate() {
    return this.hp / this.mhp
  }

  mpRate() {
    return this.mmp > 0 ? this.mp / this.mmp : 0
  }

  tpRate() {
    return this.tp / this.maxTp()
  }

  hide() {
    this._hidden = true
  }

  appear() {
    this._hidden = false
  }

  isHidden() {
    return this._hidden
  }

  isAppeared() {
    return !this.isHidden()
  }

  isDead() {
    return this.isAppeared() && this.isDeathStateAffected()
  }

  isAlive() {
    return this.isAppeared() && !this.isDeathStateAffected()
  }

  isDying() {
    return this.isAlive() && this._hp < this.mhp / 4
  }

  isRestricted() {
    return this.isAppeared() && this.restriction() > 0
  }

  canInput() {
    return this.isAppeared() && !this.isRestricted() && !this.isAutoBattle()
  }

  canMove() {
    return this.isAppeared() && this.restriction() < 4
  }

  isConfused() {
    return this.isAppeared() && this.restriction() >= 1 && this.restriction() <= 3
  }

  confusionLevel() {
    return this.isConfused() ? this.restriction() : 0
  }

  isActor() {
    return false
  }

  isEnemy() {
    return false
  }

  isBattleMember() {
    return false
  }

  friendsUnit() {
    return new Game_Unit()
  }

  opponentsUnit() {
    return new Game_Unit()
  }

  index() {
    return 0
  }

  sortStates() {
    this._states.sort((a, b) => {
      const p1 = global.$dataStates[a].priority
      const p2 = global.$dataStates[b].priority
      if (p1 !== p2) {
        return p2 - p1
      }
      return a - b
    })
  }

  restriction() {
    return Math.max(0, ...this.states().map((state) => state.restriction))
  }

  addNewState(stateId: number) {
    if (stateId === this.deathStateId()) {
      this.die()
    }
    const restricted = this.isRestricted()
    this._states.push(stateId)
    this.sortStates()
    if (!restricted && this.isRestricted()) {
      this.onRestrict()
    }
  }

  onRestrict() {
    // empty
  }

  mostImportantStateText() {
    const states = this.states()
    for (let i = 0; i < states.length; i++) {
      if (states[i].message3) {
        return states[i].message3
      }
    }
    return ''
  }

  stateMotionIndex() {
    const states = this.states()
    if (states.length > 0) {
      return states[0].motion
    } else {
      return 0
    }
  }

  stateOverlayIndex() {
    const states = this.states()
    if (states.length > 0) {
      return states[0].overlay
    } else {
      return 0
    }
  }

  isSkillWtypeOk(skill: Data_Skill) {
    return true
  }

  skillMpCost(skill: Data_Skill) {
    return Math.floor(skill.mpCost * this.mcr)
  }

  skillTpCost(skill: Data_Skill) {
    return skill.tpCost
  }

  canPaySkillCost(skill: Data_Skill) {
    return this._tp >= this.skillTpCost(skill) && this._mp >= this.skillMpCost(skill)
  }

  paySkillCost(skill: Data_Skill) {
    this._mp -= this.skillMpCost(skill)
    this._tp -= this.skillTpCost(skill)
  }

  isOccasionOk(item: Data_Item | Data_Skill) {
    if (global.$gameParty.inBattle()) {
      return item.occasion === 0 || item.occasion === 1
    } else {
      return item.occasion === 0 || item.occasion === 2
    }
  }

  meetsUsableItemConditions(item: Data_Item | Data_Skill) {
    return this.canMove() && this.isOccasionOk(item)
  }

  meetsSkillConditions(skill: Data_Skill) {
    return (this.meetsUsableItemConditions(skill) &&
      this.isSkillWtypeOk(skill) && this.canPaySkillCost(skill) &&
      !this.isSkillSealed(skill.id) && !this.isSkillTypeSealed(skill.stypeId))
  }

  meetsItemConditions(item: Data_Item) {
    return this.meetsUsableItemConditions(item) && global.$gameParty.hasItem(item)
  }

  canUse(item: Data_ItemBase | null) {
    if (!item) {
      return false
    } else if (DataManager.isSkill(item)) {
      return this.meetsSkillConditions(item as Data_Skill)
    } else if (DataManager.isItem(item)) {
      return this.meetsItemConditions(item as Data_Item)
    } else {
      return false
    }
  }

  canEquip(item: Data_ItemBase | null) {
    if (!item) {
      return false
    } else if (DataManager.isWeapon(item)) {
      return this.canEquipWeapon(item as Data_Weapon)
    } else if (DataManager.isArmor(item)) {
      return this.canEquipArmor(item as Data_Armor)
    } else {
      return false
    }
  }

  canEquipWeapon(item: Data_Weapon) {
    return this.isEquipWtypeOk(item.wtypeId) && !this.isEquipTypeSealed(item.etypeId)
  }

  canEquipArmor(item: Data_Armor) {
    return this.isEquipAtypeOk(item.atypeId) && !this.isEquipTypeSealed(item.etypeId)
  }

  attackSkillId() {
    return 1
  }

  guardSkillId() {
    return 2
  }

  canAttack() {
    return this.canUse(global.$dataSkills[this.attackSkillId()])
  }

  canGuard() {
    return this.canUse(global.$dataSkills[this.guardSkillId()])
  }
}
