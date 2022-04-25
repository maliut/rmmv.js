import {DataManager, global} from '../managers/DataManager'
import {Game_Battler} from './Game_Battler'
import {Game_Item} from './Game_Item'
import {BattleManager} from '../managers/BattleManager'
import {Game_Action} from './Game_Action'
import {TextManager} from '../managers/TextManager'
import {SoundManager} from '../managers/SoundManager'
import {Data_Armor, Data_Class, Data_Item, Data_ItemBase, Data_Skill, Data_State, Data_Weapon} from '../types/global'

// Game_Actor
//
// The game object class for an actor.
export class Game_Actor extends Game_Battler {

  private _actorId = 0
  private _name = ''
  private _nickname = ''
  private _classId = 0
  private _level = 0
  private _characterName = ''
  private _characterIndex = 0
  private _faceName = ''
  private _faceIndex = 0
  private _battlerName = ''
  private _exp: Record<number, number> = {}
  private _skills: number[] = []
  private _equips: Game_Item[] = []
  private _actionInputIndex = 0
  private _lastMenuSkill = new Game_Item()
  private _lastBattleSkill = new Game_Item()
  private _lastCommandSymbol = ''
  private _profile = ''
  private _stateSteps: Record<number, number> = {}

  get level() {
    return this._level
  }

  constructor(actorId: number) {
    super()
    this.setup(actorId)
  }

  setup(actorId: number) {
    const actor = global.$dataActors[actorId]
    this._actorId = actorId
    this._name = actor.name
    this._nickname = actor.nickname
    this._profile = actor.profile
    this._classId = actor.classId
    this._level = actor.initialLevel
    this.initImages()
    this.initExp()
    this.initSkills()
    this.initEquips(actor.equips)
    this.clearParamPlus()
    this.recoverAll()
  }

  actorId() {
    return this._actorId
  }

  actor() {
    return global.$dataActors[this._actorId]
  }

  name() {
    return this._name
  }

  setName(name: string) {
    this._name = name
  }

  nickname() {
    return this._nickname
  }

  setNickname(nickname: string) {
    this._nickname = nickname
  }

  profile() {
    return this._profile
  }

  setProfile(profile) {
    this._profile = profile
  }

  characterName() {
    return this._characterName
  }

  characterIndex() {
    return this._characterIndex
  }

  faceName() {
    return this._faceName
  }

  faceIndex() {
    return this._faceIndex
  }

  battlerName() {
    return this._battlerName
  }

  override clearStates() {
    super.clearStates()
    this._stateSteps = {}
  }

  override eraseState(stateId: number) {
    super.eraseState(stateId)
    delete this._stateSteps[stateId]
  }

  override resetStateCounts(stateId: number) {
    super.resetStateCounts(stateId)
    this._stateSteps[stateId] = global.$dataStates[stateId].stepsToRemove
  }

  initImages() {
    const actor = this.actor()
    this._characterName = actor.characterName
    this._characterIndex = actor.characterIndex
    this._faceName = actor.faceName
    this._faceIndex = actor.faceIndex
    this._battlerName = actor.battlerName
  }

  expForLevel(level: number) {
    const c = this.currentClass()
    const basis = c.expParams[0]
    const extra = c.expParams[1]
    const acc_a = c.expParams[2]
    const acc_b = c.expParams[3]
    return Math.round(basis * (Math.pow(level - 1, 0.9 + acc_a / 250)) * level *
      (level + 1) / (6 + Math.pow(level, 2) / 50 / acc_b) + (level - 1) * extra)
  }

  initExp() {
    this._exp[this._classId] = this.currentLevelExp()
  }

  currentExp() {
    return this._exp[this._classId]
  }

  currentLevelExp() {
    return this.expForLevel(this._level)
  }

  nextLevelExp() {
    return this.expForLevel(this._level + 1)
  }

  nextRequiredExp() {
    return this.nextLevelExp() - this.currentExp()
  }

  maxLevel() {
    return this.actor().maxLevel
  }

  isMaxLevel() {
    return this._level >= this.maxLevel()
  }

  initSkills() {
    this._skills = []
    this.currentClass().learnings.forEach((learning) => {
      if (learning.level <= this._level) {
        this.learnSkill(learning.skillId)
      }
    })
  }

  initEquips(equips: number[]) {
    const slots = this.equipSlots()
    const maxSlots = slots.length
    this._equips = []
    for (let i = 0; i < maxSlots; i++) {
      this._equips[i] = new Game_Item()
    }
    for (let j = 0; j < equips.length; j++) {
      if (j < maxSlots) {
        this._equips[j].setEquip(slots[j] === 1, equips[j])
      }
    }
    this.releaseUnequippableItems(true)
    this.refresh()
  }

  equipSlots() {
    const slots: number[] = []
    for (let i = 1; i < global.$dataSystem.equipTypes.length; i++) {
      slots.push(i)
    }
    if (slots.length >= 2 && this.isDualWield()) {
      slots[1] = 1
    }
    return slots
  }

  equips() {
    return this._equips.map((item) => item.object()) as (Data_Weapon | Data_Armor)[] // 装备必然是武器和防具，这里强转一下
  }

  weapons(): Data_Weapon[] {
    return this.equips().filter((item) => item && DataManager.isWeapon(item)) as Data_Weapon[]
  }

  armors(): Data_Armor[] {
    return this.equips().filter((item) => item && DataManager.isArmor(item)) as Data_Armor[]
  }

  hasWeapon(weapon: Data_Weapon) {
    return this.weapons().contains(weapon)
  }

  hasArmor(armor: Data_Armor) {
    return this.armors().contains(armor)
  }

  isEquipChangeOk(slotId: number) {
    return (!this.isEquipTypeLocked(this.equipSlots()[slotId]) &&
      !this.isEquipTypeSealed(this.equipSlots()[slotId]))
  }

  changeEquip(slotId: number, item: Data_ItemBase | null) {
    if (this.tradeItemWithParty(item, this.equips()[slotId]) && (!item || this.equipSlots()[slotId] === (item as Data_Weapon | Data_Armor).etypeId)) {
      this._equips[slotId].setObject(item)
      this.refresh()
    }
  }

  forceChangeEquip(slotId, item) {
    this._equips[slotId].setObject(item)
    this.releaseUnequippableItems(true)
    this.refresh()
  }

  tradeItemWithParty(newItem: Data_ItemBase | null, oldItem: Data_ItemBase | null) {
    if (newItem && !global.$gameParty.hasItem(newItem)) {
      return false
    } else {
      global.$gameParty.gainItem(oldItem, 1)
      global.$gameParty.loseItem(newItem, 1)
      return true
    }
  }

  changeEquipById(etypeId: number, itemId: number) {
    const slotId = etypeId - 1
    if (this.equipSlots()[slotId] === 1) {
      this.changeEquip(slotId, global.$dataWeapons[itemId])
    } else {
      this.changeEquip(slotId, global.$dataArmors[itemId])
    }
  }

  isEquipped(item: Data_Armor | Data_Weapon) {
    return this.equips().contains(item)
  }

  discardEquip(item: Data_Armor | Data_Weapon) {
    const slotId = this.equips().indexOf(item)
    if (slotId >= 0) {
      this._equips[slotId].setObject(null)
    }
  }

  releaseUnequippableItems(forcing: boolean) {
    for (; ;) {
      const slots = this.equipSlots()
      const equips = this.equips()
      let changed = false
      for (let i = 0; i < equips.length; i++) {
        const item = equips[i]
        if (item && (!this.canEquip(item) || (item as Data_Weapon | Data_Armor).etypeId !== slots[i])) {
          if (!forcing) {
            this.tradeItemWithParty(null, item)
          }
          this._equips[i].setObject(null)
          changed = true
        }
      }
      if (!changed) {
        break
      }
    }
  }

  clearEquipments() {
    const maxSlots = this.equipSlots().length
    for (let i = 0; i < maxSlots; i++) {
      if (this.isEquipChangeOk(i)) {
        this.changeEquip(i, null)
      }
    }
  }

  optimizeEquipments() {
    const maxSlots = this.equipSlots().length
    this.clearEquipments()
    for (let i = 0; i < maxSlots; i++) {
      if (this.isEquipChangeOk(i)) {
        this.changeEquip(i, this.bestEquipItem(i))
      }
    }
  }

  bestEquipItem(slotId: number) {
    const etypeId = this.equipSlots()[slotId]
    const items = global.$gameParty.equipItems().filter((item) => {
      return item.etypeId === etypeId && this.canEquip(item)
    })
    let bestItem: Data_Armor | Data_Weapon | null = null
    let bestPerformance = -1000
    for (let i = 0; i < items.length; i++) {
      const performance = this.calcEquipItemPerformance(items[i])
      if (performance > bestPerformance) {
        bestPerformance = performance
        bestItem = items[i]
      }
    }
    return bestItem
  }

  calcEquipItemPerformance(item: Data_Weapon | Data_Armor) {
    return item.params.reduce((a, b) => a + b)
  }

  override isSkillWtypeOk(skill: Data_Skill) {
    const wtypeId1 = skill.requiredWtypeId1
    const wtypeId2 = skill.requiredWtypeId2
    return (wtypeId1 === 0 && wtypeId2 === 0) ||
      (wtypeId1 > 0 && this.isWtypeEquipped(wtypeId1)) ||
      (wtypeId2 > 0 && this.isWtypeEquipped(wtypeId2))
  }

  isWtypeEquipped(wtypeId: number) {
    return this.weapons().some((weapon) => weapon.wtypeId === wtypeId)
  }

  override refresh() {
    this.releaseUnequippableItems(false)
    super.refresh()
  }

  override isActor() {
    return true
  }

  override friendsUnit() {
    return global.$gameParty
  }

  override opponentsUnit() {
    return global.$gameTroop
  }

  override index() {
    return global.$gameParty.members().indexOf(this)
  }

  override isBattleMember() {
    return global.$gameParty.battleMembers().contains(this)
  }

  isFormationChangeOk() {
    return true
  }

  currentClass() {
    return global.$dataClasses[this._classId]
  }

  isClass(gameClass: Data_Class) {
    return gameClass && this._classId === gameClass.id
  }

  skills() {
    const list: Data_Skill[] = []
    this._skills.concat(this.addedSkills()).forEach((id) => {
      if (!list.contains(global.$dataSkills[id])) {
        list.push(global.$dataSkills[id])
      }
    })
    return list
  }

  usableSkills() {
    return this.skills().filter((skill) => this.canUse(skill))
  }

  override traitObjects() {
    let objects = super.traitObjects()
    objects = objects.concat([this.actor(), this.currentClass()])
    const equips = this.equips()
    for (let i = 0; i < equips.length; i++) {
      const item = equips[i]
      if (item) {
        objects.push(item)
      }
    }
    return objects
  }

  override attackElements() {
    const set = super.attackElements()
    if (this.hasNoWeapons() && !set.contains(this.bareHandsElementId())) {
      set.push(this.bareHandsElementId())
    }
    return set
  }

  hasNoWeapons() {
    return this.weapons().length === 0
  }

  bareHandsElementId() {
    return 1
  }

  override paramMax(paramId: number) {
    if (paramId === 0) {
      return 9999    // MHP
    }
    return super.paramMax(paramId)
  }

  override paramBase(paramId: number) {
    return this.currentClass().params[paramId][this._level]
  }

  override paramPlus(paramId: number) {
    let value = super.paramPlus(paramId)
    const equips = this.equips()
    for (let i = 0; i < equips.length; i++) {
      const item = equips[i]
      if (item) {
        value += item.params[paramId]
      }
    }
    return value
  }

  attackAnimationId1() {
    if (this.hasNoWeapons()) {
      return this.bareHandsAnimationId()
    } else {
      const weapons = this.weapons()
      return weapons[0] ? weapons[0].animationId : 0
    }
  }

  attackAnimationId2() {
    const weapons = this.weapons()
    return weapons[1] ? weapons[1].animationId : 0
  }

  bareHandsAnimationId() {
    return 1
  }

  changeExp(exp: number, show: boolean) {
    this._exp[this._classId] = Math.max(exp, 0)
    const lastLevel = this._level
    const lastSkills = this.skills()
    while (!this.isMaxLevel() && this.currentExp() >= this.nextLevelExp()) {
      this.levelUp()
    }
    while (this.currentExp() < this.currentLevelExp()) {
      this.levelDown()
    }
    if (show && this._level > lastLevel) {
      this.displayLevelUp(this.findNewSkills(lastSkills))
    }
    this.refresh()
  }

  levelUp() {
    this._level++
    this.currentClass().learnings.forEach((learning) => {
      if (learning.level === this._level) {
        this.learnSkill(learning.skillId)
      }
    })
  }

  levelDown() {
    this._level--
  }

  findNewSkills(lastSkills: Data_Skill[]) {
    const newSkills = this.skills()
    for (let i = 0; i < lastSkills.length; i++) {
      const index = newSkills.indexOf(lastSkills[i])
      if (index >= 0) {
        newSkills.splice(index, 1)
      }
    }
    return newSkills
  }

  displayLevelUp(newSkills: Data_Skill[]) {
    const text = TextManager.levelUp.format(this._name, TextManager.level, this._level)
    global.$gameMessage.newPage()
    global.$gameMessage.add(text)
    newSkills.forEach((skill) => {
      global.$gameMessage.add(TextManager.obtainSkill.format(skill.name))
    })
  }

  gainExp(exp: number) {
    const newExp = this.currentExp() + Math.round(exp * this.finalExpRate())
    this.changeExp(newExp, this.shouldDisplayLevelUp())
  }

  finalExpRate() {
    return this.exr * (this.isBattleMember() ? 1 : this.benchMembersExpRate())
  }

  benchMembersExpRate() {
    return global.$dataSystem.optExtraExp ? 1 : 0
  }

  shouldDisplayLevelUp() {
    return true
  }

  changeLevel(level: number, show: boolean) {
    level = level.clamp(1, this.maxLevel())
    this.changeExp(this.expForLevel(level), show)
  }

  learnSkill(skillId: number) {
    if (!this.isLearnedSkill(skillId)) {
      this._skills.push(skillId)
      this._skills.sort((a, b) => a - b)
    }
  }

  forgetSkill(skillId: number) {
    const index = this._skills.indexOf(skillId)
    if (index >= 0) {
      this._skills.splice(index, 1)
    }
  }

  isLearnedSkill(skillId: number) {
    return this._skills.contains(skillId)
  }

  hasSkill(skillId: number) {
    return this.skills().contains(global.$dataSkills[skillId])
  }

  changeClass(classId: number, keepExp: boolean) {
    if (keepExp) {
      this._exp[classId] = this.currentExp()
    }
    this._classId = classId
    this.changeExp(this._exp[this._classId] || 0, false)
    this.refresh()
  }

  setCharacterImage(characterName: string, characterIndex: number) {
    this._characterName = characterName
    this._characterIndex = characterIndex
  }

  setFaceImage(faceName: string, faceIndex: number) {
    this._faceName = faceName
    this._faceIndex = faceIndex
  }

  setBattlerImage(battlerName: string) {
    this._battlerName = battlerName
  }

  isSpriteVisible() {
    return global.$gameSystem.isSideView()
  }

  override startAnimation(animationId: number, mirror: boolean, delay: number) {
    mirror = !mirror
    super.startAnimation(animationId, mirror, delay)
  }

  override performAction(action: Game_Action) {
    super.performAction(action)
    if (action.isAttack()) {
      this.performAttack()
    } else if (action.isGuard()) {
      this.requestMotion('guard')
    } else if (action.isMagicSkill()) {
      this.requestMotion('spell')
    } else if (action.isSkill()) {
      this.requestMotion('skill')
    } else if (action.isItem()) {
      this.requestMotion('item')
    }
  }

  performAttack() {
    const weapons = this.weapons()
    const wtypeId = weapons[0] ? weapons[0].wtypeId : 0
    const attackMotion = global.$dataSystem.attackMotions[wtypeId]
    if (attackMotion) {
      if (attackMotion.type === 0) {
        this.requestMotion('thrust')
      } else if (attackMotion.type === 1) {
        this.requestMotion('swing')
      } else if (attackMotion.type === 2) {
        this.requestMotion('missile')
      }
      this.startWeaponAnimation(attackMotion.weaponImageId)
    }
  }

  override performDamage() {
    if (this.isSpriteVisible()) {
      this.requestMotion('damage')
    } else {
      global.$gameScreen.startShake(5, 5, 10)
    }
    SoundManager.playActorDamage()
  }

  override performEvasion() {
    super.performEvasion()
    this.requestMotion('evade')
  }

  override performMagicEvasion() {
    super.performMagicEvasion()
    this.requestMotion('evade')
  }

  override performCounter() {
    super.performCounter()
    this.performAttack()
  }

  override performCollapse() {
    if (global.$gameParty.inBattle()) {
      SoundManager.playActorCollapse()
    }
  }

  performVictory() {
    if (this.canMove()) {
      this.requestMotion('victory')
    }
  }

  performEscape() {
    if (this.canMove()) {
      this.requestMotion('escape')
    }
  }

  makeActionList() {
    const list: Game_Action[] = []
    let action = new Game_Action(this)
    action.setAttack()
    list.push(action)
    this.usableSkills().forEach((skill) => {
      action = new Game_Action(this)
      action.setSkill(skill.id)
      list.push(action)
    })
    return list
  }

  makeAutoBattleActions() {
    for (let i = 0; i < this.numActions(); i++) {
      const list = this.makeActionList()
      let maxValue = Number.MIN_VALUE
      for (let j = 0; j < list.length; j++) {
        const value = list[j].evaluate()
        if (value > maxValue) {
          maxValue = value
          this.setAction(i, list[j])
        }
      }
    }
    this.setActionState('waiting')
  }

  makeConfusionActions() {
    for (let i = 0; i < this.numActions(); i++) {
      this.action(i).setConfusion()
    }
    this.setActionState('waiting')
  }

  override makeActions() {
    super.makeActions()
    if (this.numActions() > 0) {
      this.setActionState('undecided')
    } else {
      this.setActionState('waiting')
    }
    if (this.isAutoBattle()) {
      this.makeAutoBattleActions()
    } else if (this.isConfused()) {
      this.makeConfusionActions()
    }
  }

  onPlayerWalk() {
    this.clearResult()
    this.checkFloorEffect()
    if (global.$gamePlayer.isNormal()) {
      this.turnEndOnMap()
      this.states().forEach((state) => {
        this.updateStateSteps(state)
      })
      this.showAddedStates()
      this.showRemovedStates()
    }
  }

  updateStateSteps(state: Data_State) {
    if (state.removeByWalking) {
      if (this._stateSteps[state.id] > 0) {
        if (--this._stateSteps[state.id] === 0) {
          this.removeState(state.id)
        }
      }
    }
  }

  showAddedStates() {
    this.result().addedStateObjects().forEach((state) => {
      if (state.message1) {
        global.$gameMessage.add(this._name + state.message1)
      }
    })
  }

  showRemovedStates() {
    this.result().removedStateObjects().forEach((state) => {
      if (state.message4) {
        global.$gameMessage.add(this._name + state.message4)
      }
    })
  }

  stepsForTurn() {
    return 20
  }

  turnEndOnMap() {
    if (global.$gameParty.steps() % this.stepsForTurn() === 0) {
      this.onTurnEnd()
      if (this.result().hpDamage > 0) {
        this.performMapDamage()
      }
    }
  }

  checkFloorEffect() {
    if (global.$gamePlayer.isOnDamageFloor()) {
      this.executeFloorDamage()
    }
  }

  executeFloorDamage() {
    let damage = Math.floor(this.basicFloorDamage() * this.fdr)
    damage = Math.min(damage, this.maxFloorDamage())
    this.gainHp(-damage)
    if (damage > 0) {
      this.performMapDamage()
    }
  }

  basicFloorDamage() {
    return 10
  }

  maxFloorDamage() {
    return global.$dataSystem.optFloorDeath ? this.hp : Math.max(this.hp - 1, 0)
  }

  performMapDamage() {
    if (!global.$gameParty.inBattle()) {
      global.$gameScreen.startFlashForDamage()
    }
  }

  override clearActions() {
    super.clearActions()
    this._actionInputIndex = 0
  }

  inputtingAction() {
    return this.action(this._actionInputIndex)
  }

  selectNextCommand() {
    if (this._actionInputIndex < this.numActions() - 1) {
      this._actionInputIndex++
      return true
    } else {
      return false
    }
  }

  selectPreviousCommand() {
    if (this._actionInputIndex > 0) {
      this._actionInputIndex--
      return true
    } else {
      return false
    }
  }

  lastMenuSkill() {
    return this._lastMenuSkill.object() as Data_Skill | null
  }

  setLastMenuSkill(skill: Data_ItemBase | null) {
    this._lastMenuSkill.setObject(skill)
  }

  lastBattleSkill() {
    return this._lastBattleSkill.object() as Data_Skill | null
  }

  setLastBattleSkill(skill: Data_Skill) {
    this._lastBattleSkill.setObject(skill)
  }

  lastCommandSymbol() {
    return this._lastCommandSymbol
  }

  setLastCommandSymbol(symbol) {
    this._lastCommandSymbol = symbol
  }

  testEscape(item: Data_Skill | Data_Item) {
    return item.effects.some((effect) => effect && effect.code === Game_Action.EFFECT_SPECIAL)
  }

  override meetsUsableItemConditions(item: Data_Skill | Data_Item) {
    if (global.$gameParty.inBattle() && !BattleManager.canEscape() && this.testEscape(item)) {
      return false
    }
    return super.meetsUsableItemConditions(item)
  }
}
