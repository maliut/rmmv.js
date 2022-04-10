import {global} from '../managers/DataManager'

// Game_ActionResult
//
// The game object class for a result of a battle action. For convinience, all
// member variables in this class are public.
export class Game_ActionResult {

  used = false
  missed = false
  evaded = false
  physical = false
  drain = false
  critical = false
  success = false
  hpAffected = false
  hpDamage = 0
  mpDamage = 0
  tpDamage = 0
  addedStates = []
  removedStates = []
  addedBuffs = []
  addedDebuffs = []
  removedBuffs = []

  constructor() {
    this.clear()
  }

  clear() {
    this.used = false
    this.missed = false
    this.evaded = false
    this.physical = false
    this.drain = false
    this.critical = false
    this.success = false
    this.hpAffected = false
    this.hpDamage = 0
    this.mpDamage = 0
    this.tpDamage = 0
    this.addedStates = []
    this.removedStates = []
    this.addedBuffs = []
    this.addedDebuffs = []
    this.removedBuffs = []
  }

  addedStateObjects() {
    return this.addedStates.map(function (id) {
      return global.$dataStates[id]
    })
  }

  removedStateObjects() {
    return this.removedStates.map(function (id) {
      return global.$dataStates[id]
    })
  }

  isStatusAffected() {
    return (this.addedStates.length > 0 || this.removedStates.length > 0 ||
      this.addedBuffs.length > 0 || this.addedDebuffs.length > 0 ||
      this.removedBuffs.length > 0)
  }

  isHit() {
    return this.used && !this.missed && !this.evaded
  }

  isStateAdded(stateId) {
    return this.addedStates.contains(stateId)
  }

  pushAddedState(stateId) {
    if (!this.isStateAdded(stateId)) {
      this.addedStates.push(stateId)
    }
  }

  isStateRemoved(stateId) {
    return this.removedStates.contains(stateId)
  }

  pushRemovedState(stateId) {
    if (!this.isStateRemoved(stateId)) {
      this.removedStates.push(stateId)
    }
  }

  isBuffAdded(paramId) {
    return this.addedBuffs.contains(paramId)
  }

  pushAddedBuff(paramId) {
    if (!this.isBuffAdded(paramId)) {
      this.addedBuffs.push(paramId)
    }
  }

  isDebuffAdded(paramId) {
    return this.addedDebuffs.contains(paramId)
  }

  pushAddedDebuff(paramId) {
    if (!this.isDebuffAdded(paramId)) {
      this.addedDebuffs.push(paramId)
    }
  }

  isBuffRemoved(paramId) {
    return this.removedBuffs.contains(paramId)
  }

  pushRemovedBuff(paramId) {
    if (!this.isBuffRemoved(paramId)) {
      this.removedBuffs.push(paramId)
    }
  }
}
