import {Game_Unit} from './Game_Unit'
import {Game_Item} from './Game_Item'
import {DataManager, global} from '../managers/DataManager'
import {TextManager} from '../managers/TextManager'

// Game_Party
//
// The game object class for the party. Information such as gold and items is
// included.
export class Game_Party extends Game_Unit {

  static ABILITY_ENCOUNTER_HALF = 0
  static ABILITY_ENCOUNTER_NONE = 1
  static ABILITY_CANCEL_SURPRISE = 2
  static ABILITY_RAISE_PREEMPTIVE = 3
  static ABILITY_GOLD_DOUBLE = 4
  static ABILITY_DROP_ITEM_DOUBLE = 5

  private _gold = 0
  private _steps = 0
  private _lastItem = new Game_Item()
  private _menuActorId = 0
  private _targetActorId = 0
  private _actors = []
  private _items = {}
  private _weapons = {}
  private _armors = {}

  constructor() {
    super()
    this.initAllItems()
  }

  initAllItems() {
    this._items = {}
    this._weapons = {}
    this._armors = {}
  }

  exists() {
    return this._actors.length > 0
  }

  size() {
    return this.members().length
  }

  isEmpty() {
    return this.size() === 0
  }

  override members() {
    return this.inBattle() ? this.battleMembers() : this.allMembers()
  }

  allMembers() {
    return this._actors.map(function (id) {
      return global.$gameActors.actor(id)
    })
  }

  battleMembers() {
    return this.allMembers().slice(0, this.maxBattleMembers()).filter(function (actor) {
      return actor.isAppeared()
    })
  }

  maxBattleMembers() {
    return 4
  }

  leader() {
    return this.battleMembers()[0]
  }

  reviveBattleMembers() {
    this.battleMembers().forEach(function (actor) {
      if (actor.isDead()) {
        actor.setHp(1)
      }
    })
  }

  items() {
    const list = []
    for (const id in this._items) {
      list.push(global.$dataItems[id])
    }
    return list
  }

  weapons() {
    const list = []
    for (const id in this._weapons) {
      list.push(global.$dataWeapons[id])
    }
    return list
  }

  armors() {
    const list = []
    for (const id in this._armors) {
      list.push(global.$dataArmors[id])
    }
    return list
  }

  equipItems() {
    return this.weapons().concat(this.armors())
  }

  allItems() {
    return this.items().concat(this.equipItems())
  }

  itemContainer(item) {
    if (!item) {
      return null
    } else if (DataManager.isItem(item)) {
      return this._items
    } else if (DataManager.isWeapon(item)) {
      return this._weapons
    } else if (DataManager.isArmor(item)) {
      return this._armors
    } else {
      return null
    }
  }

  setupStartingMembers() {
    this._actors = []
    global.$dataSystem.partyMembers.forEach(function (actorId) {
      if (global.$gameActors.actor(actorId)) {
        this._actors.push(actorId)
      }
    }, this)
  }

  name() {
    const numBattleMembers = this.battleMembers().length
    if (numBattleMembers === 0) {
      return ''
    } else if (numBattleMembers === 1) {
      return this.leader().name()
    } else {
      return TextManager.partyName.format(this.leader().name())
    }
  }

  setupBattleTest() {
    this.setupBattleTestMembers()
    this.setupBattleTestItems()
  }

  setupBattleTestMembers() {
    global.$dataSystem.testBattlers.forEach(function (battler) {
      const actor = global.$gameActors.actor(battler.actorId)
      if (actor) {
        actor.changeLevel(battler.level, false)
        actor.initEquips(battler.equips)
        actor.recoverAll()
        this.addActor(battler.actorId)
      }
    }, this)
  }

  setupBattleTestItems() {
    global.$dataItems.forEach(function (item) {
      if (item && item.name.length > 0) {
        this.gainItem(item, this.maxItems(item))
      }
    }, this)
  }

  highestLevel() {
    return Math.max.apply(null, this.members().map(function (actor) {
      return actor.level
    }))
  }

  addActor(actorId) {
    if (!this._actors.contains(actorId)) {
      this._actors.push(actorId)
      global.$gamePlayer.refresh()
      global.$gameMap.requestRefresh()
    }
  }

  removeActor(actorId) {
    if (this._actors.contains(actorId)) {
      this._actors.splice(this._actors.indexOf(actorId), 1)
      global.$gamePlayer.refresh()
      global.$gameMap.requestRefresh()
    }
  }

  gold() {
    return this._gold
  }

  gainGold(amount) {
    this._gold = (this._gold + amount).clamp(0, this.maxGold())
  }

  loseGold(amount) {
    this.gainGold(-amount)
  }

  maxGold() {
    return 99999999
  }

  steps() {
    return this._steps
  }

  increaseSteps() {
    this._steps++
  }

  numItems(item) {
    const container = this.itemContainer(item)
    return container ? container[item.id] || 0 : 0
  }

  maxItems(item) {
    return 99
  }

  hasMaxItems(item) {
    return this.numItems(item) >= this.maxItems(item)
  }

  hasItem(item, includeEquip) {
    if (includeEquip === undefined) {
      includeEquip = false
    }
    if (this.numItems(item) > 0) {
      return true
    } else if (includeEquip && this.isAnyMemberEquipped(item)) {
      return true
    } else {
      return false
    }
  }

  isAnyMemberEquipped(item) {
    return this.members().some(function (actor) {
      return actor.equips().contains(item)
    })
  }

  gainItem(item, amount, includeEquip) {
    const container = this.itemContainer(item)
    if (container) {
      const lastNumber = this.numItems(item)
      const newNumber = lastNumber + amount
      container[item.id] = newNumber.clamp(0, this.maxItems(item))
      if (container[item.id] === 0) {
        delete container[item.id]
      }
      if (includeEquip && newNumber < 0) {
        this.discardMembersEquip(item, -newNumber)
      }
      global.$gameMap.requestRefresh()
    }
  }

  discardMembersEquip(item, amount) {
    let n = amount
    this.members().forEach(function (actor) {
      while (n > 0 && actor.isEquipped(item)) {
        actor.discardEquip(item)
        n--
      }
    })
  }

  loseItem(item, amount, includeEquip) {
    this.gainItem(item, -amount, includeEquip)
  }

  consumeItem(item) {
    if (DataManager.isItem(item) && item.consumable) {
      this.loseItem(item, 1 , false) // changed
    }
  }

  canUse(item) {
    return this.members().some(function (actor) {
      return actor.canUse(item)
    })
  }

  canInput() {
    return this.members().some(function (actor) {
      return actor.canInput()
    })
  }

  override isAllDead() {
    if (super.isAllDead()) {
      return this.inBattle() || !this.isEmpty()
    } else {
      return false
    }
  }

  onPlayerWalk() {
    this.members().forEach(function (actor) {
      return actor.onPlayerWalk()
    })
  }

  menuActor() {
    let actor = global.$gameActors.actor(this._menuActorId)
    if (!this.members().contains(actor)) {
      actor = this.members()[0]
    }
    return actor
  }

  setMenuActor(actor) {
    this._menuActorId = actor.actorId()
  }

  makeMenuActorNext() {
    let index = this.members().indexOf(this.menuActor())
    if (index >= 0) {
      index = (index + 1) % this.members().length
      this.setMenuActor(this.members()[index])
    } else {
      this.setMenuActor(this.members()[0])
    }
  }

  makeMenuActorPrevious() {
    let index = this.members().indexOf(this.menuActor())
    if (index >= 0) {
      index = (index + this.members().length - 1) % this.members().length
      this.setMenuActor(this.members()[index])
    } else {
      this.setMenuActor(this.members()[0])
    }
  }

  targetActor() {
    let actor = global.$gameActors.actor(this._targetActorId)
    if (!this.members().contains(actor)) {
      actor = this.members()[0]
    }
    return actor
  }

  setTargetActor(actor) {
    this._targetActorId = actor.actorId()
  }

  lastItem() {
    return this._lastItem.object()
  }

  setLastItem(item) {
    this._lastItem.setObject(item)
  }

  swapOrder(index1, index2) {
    const temp = this._actors[index1]
    this._actors[index1] = this._actors[index2]
    this._actors[index2] = temp
    global.$gamePlayer.refresh()
  }

  charactersForSavefile() {
    return this.battleMembers().map(function (actor) {
      return [actor.characterName(), actor.characterIndex()]
    })
  }

  facesForSavefile() {
    return this.battleMembers().map(function (actor) {
      return [actor.faceName(), actor.faceIndex()]
    })
  }

  partyAbility(abilityId) {
    return this.battleMembers().some(function (actor) {
      return actor.partyAbility(abilityId)
    })
  }

  hasEncounterHalf() {
    return this.partyAbility(Game_Party.ABILITY_ENCOUNTER_HALF)
  }

  hasEncounterNone() {
    return this.partyAbility(Game_Party.ABILITY_ENCOUNTER_NONE)
  }

  hasCancelSurprise() {
    return this.partyAbility(Game_Party.ABILITY_CANCEL_SURPRISE)
  }

  hasRaisePreemptive() {
    return this.partyAbility(Game_Party.ABILITY_RAISE_PREEMPTIVE)
  }

  hasGoldDouble() {
    return this.partyAbility(Game_Party.ABILITY_GOLD_DOUBLE)
  }

  hasDropItemDouble() {
    return this.partyAbility(Game_Party.ABILITY_DROP_ITEM_DOUBLE)
  }

  ratePreemptive(troopAgi) {
    let rate = this.agility() >= troopAgi ? 0.05 : 0.03
    if (this.hasRaisePreemptive()) {
      rate *= 4
    }
    return rate
  }

  rateSurprise(troopAgi) {
    let rate = this.agility() >= troopAgi ? 0.03 : 0.05
    if (this.hasCancelSurprise()) {
      rate = 0
    }
    return rate
  }

  performVictory() {
    this.members().forEach(function (actor) {
      actor.performVictory()
    })
  }

  performEscape() {
    this.members().forEach(function (actor) {
      actor.performEscape()
    })
  }

  removeBattleStates() {
    this.members().forEach(function (actor) {
      actor.removeBattleStates()
    })
  }

  requestMotionRefresh() {
    this.members().forEach(function (actor) {
      actor.requestMotionRefresh()
    })
  }
}
