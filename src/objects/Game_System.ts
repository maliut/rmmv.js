import {AudioManager} from '../managers/AudioManager'
import {Graphics} from '../core/Graphics'
import {global} from '../managers/DataManager'

// Game_System
//
// The game object class for the system data.
export class Game_System {
  private _saveEnabled = true
  private _menuEnabled = true
  private _encounterEnabled = true
  private _formationEnabled = true
  private _battleCount = 0
  private _winCount = 0
  private _escapeCount = 0
  private _saveCount = 0
  private _versionId = 0
  private _framesOnSave = 0
  private _bgmOnSave = null
  private _bgsOnSave = null
  private _windowTone = null
  private _battleBgm = null
  private _victoryMe = null
  private _defeatMe = null
  private _savedBgm = null
  private _walkingBgm = null

  isJapanese() {
    return global.$dataSystem.locale.match(/^ja/)
  }

  isChinese() {
    return global.$dataSystem.locale.match(/^zh/)
  }

  isKorean() {
    return global.$dataSystem.locale.match(/^ko/)
  }

  isCJK() {
    return global.$dataSystem.locale.match(/^(ja|zh|ko)/)
  }

  isRussian() {
    return global.$dataSystem.locale.match(/^ru/)
  }

  isSideView() {
    return global.$dataSystem.optSideView
  }

  isSaveEnabled() {
    return this._saveEnabled
  }

  disableSave() {
    this._saveEnabled = false
  }

  enableSave() {
    this._saveEnabled = true
  }

  isMenuEnabled() {
    return this._menuEnabled
  }

  disableMenu() {
    this._menuEnabled = false
  }

  enableMenu() {
    this._menuEnabled = true
  }

  isEncounterEnabled() {
    return this._encounterEnabled
  }

  disableEncounter() {
    this._encounterEnabled = false
  }

  enableEncounter() {
    this._encounterEnabled = true
  }

  isFormationEnabled() {
    return this._formationEnabled
  }

  disableFormation() {
    this._formationEnabled = false
  }

  enableFormation() {
    this._formationEnabled = true
  }

  battleCount() {
    return this._battleCount
  }

  winCount() {
    return this._winCount
  }

  escapeCount() {
    return this._escapeCount
  }

  saveCount() {
    return this._saveCount
  }

  versionId() {
    return this._versionId
  }

  windowTone() {
    return this._windowTone || global.$dataSystem.windowTone
  }

  setWindowTone(value) {
    this._windowTone = value
  }

  battleBgm() {
    return this._battleBgm || global.$dataSystem.battleBgm
  }

  setBattleBgm(value) {
    this._battleBgm = value
  }

  victoryMe() {
    return this._victoryMe || global.$dataSystem.victoryMe
  }

  setVictoryMe(value) {
    this._victoryMe = value
  }

  defeatMe() {
    return this._defeatMe || global.$dataSystem.defeatMe
  }

  setDefeatMe(value) {
    this._defeatMe = value
  }

  onBattleStart() {
    this._battleCount++
  }

  onBattleWin() {
    this._winCount++
  }

  onBattleEscape() {
    this._escapeCount++
  }

  onBeforeSave() {
    this._saveCount++
    this._versionId = global.$dataSystem.versionId
    this._framesOnSave = Graphics.frameCount
    this._bgmOnSave = AudioManager.saveBgm()
    this._bgsOnSave = AudioManager.saveBgs()
  }

  onAfterLoad() {
    Graphics.frameCount = this._framesOnSave
    AudioManager.playBgm(this._bgmOnSave)
    AudioManager.playBgs(this._bgsOnSave)
  }

  playtime() {
    return Math.floor(Graphics.frameCount / 60)
  }

  playtimeText() {
    const hour = Math.floor(this.playtime() / 60 / 60)
    const min = Math.floor(this.playtime() / 60) % 60
    const sec = this.playtime() % 60
    return hour.padZero(2) + ':' + min.padZero(2) + ':' + sec.padZero(2)
  }

  saveBgm() {
    this._savedBgm = AudioManager.saveBgm()
  }

  replayBgm() {
    if (this._savedBgm) {
      AudioManager.replayBgm(this._savedBgm)
    }
  }

  saveWalkingBgm() {
    this._walkingBgm = AudioManager.saveBgm()
  }

  replayWalkingBgm() {
    if (this._walkingBgm) {
      AudioManager.playBgm(this._walkingBgm)
    }
  }

  saveWalkingBgm2() {
    this._walkingBgm = global.$dataMap.bgm
  }
}
