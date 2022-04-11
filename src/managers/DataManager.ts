import {JsonEx} from '../core/JsonEx'
import {ResourceHandler} from '../core/ResourceHandler'
import {Graphics} from '../core/Graphics'
import {Utils} from '../core/Utils'
import {Decrypter} from '../core/Decrypter'
import {StorageManager} from './StorageManager'
import {ImageManager} from './ImageManager'
import {BattleManager} from './BattleManager'
import {Game_System} from '../objects/Game_System'
import {Game_Screen} from '../objects/Game_Screen'
import {Game_Temp} from '../objects/Game_Temp'
import {Game_Timer} from '../objects/Game_Timer'
import {Game_Message} from '../objects/Game_Message'
import {Game_Variables} from '../objects/Game_Variables'
import {Game_Switches} from '../objects/Game_Switches'
import {Game_SelfSwitches} from '../objects/Game_SelfSwitches'
import {Game_Actors} from '../objects/Game_Actors'
import {Game_Party} from '../objects/Game_Party'
import {Game_Troop} from '../objects/Game_Troop'
import {Game_Player} from '../objects/Game_Player'
import {Game_Map} from '../objects/Game_Map'
import {Scene_Boot} from '../scenes/Scene_Boot'

// 全局变量，嵌套一层，避免转译后潜在不一致问题，并方便遍历处理. 缺点是外部使用的时候都要处理下
// todo 以后可将 json 直接导入，无需额外 load

export const global = {
  $dataActors: null,
  $dataClasses: null,
  $dataSkills: null,
  $dataItems: null,
  $dataWeapons: null,
  $dataArmors: null,
  $dataEnemies: null,
  $dataTroops: null,
  $dataStates: null,
  $dataAnimations: null,
  $dataTilesets: null,
  $dataCommonEvents: null,
  $dataSystem: null,
  $dataMapInfos: null,
  $dataMap: null,
  $gameTemp: null,
  $gameSystem: null,
  $gameScreen: null,
  $gameTimer: null,
  $gameMessage: null,
  $gameSwitches: null,
  $gameVariables: null,
  $gameSelfSwitches: null,
  $gameActors: null,
  $gameParty: null,
  $gameTroop: null,
  $gameMap: null,
  $gamePlayer: null,
  $testEvent: null,
}

// DataManager
//
// The static class that manages the database and game objects.
export class DataManager {

  private static _globalId = 'RPGMV'
  private static _lastAccessedId = 1
  private static _errorUrl = null
  private static _mapLoader?: () => void

  private static _databaseFiles = [
    {name: '$dataActors', src: 'Actors.json'},
    {name: '$dataClasses', src: 'Classes.json'},
    {name: '$dataSkills', src: 'Skills.json'},
    {name: '$dataItems', src: 'Items.json'},
    {name: '$dataWeapons', src: 'Weapons.json'},
    {name: '$dataArmors', src: 'Armors.json'},
    {name: '$dataEnemies', src: 'Enemies.json'},
    {name: '$dataTroops', src: 'Troops.json'},
    {name: '$dataStates', src: 'States.json'},
    {name: '$dataAnimations', src: 'Animations.json'},
    {name: '$dataTilesets', src: 'Tilesets.json'},
    {name: '$dataCommonEvents', src: 'CommonEvents.json'},
    {name: '$dataSystem', src: 'System.json'},
    {name: '$dataMapInfos', src: 'MapInfos.json'}
  ]

  static loadDatabase() {
    const test = this.isBattleTest() || this.isEventTest()
    const prefix = test ? 'Test_' : ''
    for (let i = 0; i < this._databaseFiles.length; i++) {
      const name = this._databaseFiles[i].name
      const src = this._databaseFiles[i].src
      this.loadDataFile(name, prefix + src)
    }
    if (this.isEventTest()) {
      this.loadDataFile('$testEvent', prefix + 'Event.json')
    }
  }

  static loadDataFile(name, src) {
    const xhr = new XMLHttpRequest()
    const url = 'data/' + src
    xhr.open('GET', url)
    xhr.overrideMimeType('application/json')
    xhr.onload = function () {
      if (xhr.status < 400) {
        global[name] = JSON.parse(xhr.responseText)
        DataManager.onLoad(global[name])
      }
    }
    xhr.onerror = this._mapLoader || function () {
      DataManager._errorUrl = DataManager._errorUrl || url
    }
    global[name] = null
    xhr.send()
  }

  static isDatabaseLoaded() {
    this.checkError()
    for (let i = 0; i < this._databaseFiles.length; i++) {
      if (!global[this._databaseFiles[i].name]) {
        return false
      }
    }
    return true
  }

  static loadMapData(mapId) {
    if (mapId > 0) {
      // @ts-ignore
      const filename = 'Map%1.json'.format(mapId.padZero(3))
      this._mapLoader = ResourceHandler.createLoader('data/' + filename, this.loadDataFile.bind(this, '$dataMap', filename))
      this.loadDataFile('$dataMap', filename)
    } else {
      this.makeEmptyMap()
    }
  }

  static makeEmptyMap() {
    global.$dataMap = {}
    global.$dataMap.data = []
    global.$dataMap.events = []
    global.$dataMap.width = 100
    global.$dataMap.height = 100
    global.$dataMap.scrollType = 3
  }

  static isMapLoaded() {
    this.checkError()
    return !!global.$dataMap
  }

  static onLoad(object) {
    let array
    if (object === global.$dataMap) {
      this.extractMetadata(object)
      array = object.events
    } else {
      array = object
    }
    if (Array.isArray(array)) {
      for (let i = 0; i < array.length; i++) {
        const data = array[i]
        if (data && data.note !== undefined) {
          this.extractMetadata(data)
        }
      }
    }
    if (object === global.$dataSystem) {
      Decrypter.hasEncryptedImages = !!object.hasEncryptedImages
      Decrypter.hasEncryptedAudio = !!object.hasEncryptedAudio
      Scene_Boot.loadSystemImages()
    }
  }

  static extractMetadata(data) {
    const re = /<([^<>:]+)(:?)([^>]*)>/g
    data.meta = {}
    for (; ;) {
      const match = re.exec(data.note)
      if (match) {
        if (match[2] === ':') {
          data.meta[match[1]] = match[3]
        } else {
          data.meta[match[1]] = true
        }
      } else {
        break
      }
    }
  }

  static checkError() {
    if (DataManager._errorUrl) {
      throw new Error('Failed to load: ' + DataManager._errorUrl)
    }
  }

  static isBattleTest() {
    return Utils.isOptionValid('btest')
  }

  static isEventTest() {
    return Utils.isOptionValid('etest')
  }

  static isSkill(item) {
    return item && global.$dataSkills.contains(item)
  }

  static isItem(item) {
    return item && global.$dataItems.contains(item)
  }

  static isWeapon(item) {
    return item && global.$dataWeapons.contains(item)
  }

  static isArmor(item) {
    return item && global.$dataArmors.contains(item)
  }

  static createGameObjects() {
    global.$gameTemp = new Game_Temp()
    global.$gameSystem = new Game_System()
    global.$gameScreen = new Game_Screen()
    global.$gameTimer = new Game_Timer()
    global.$gameMessage = new Game_Message()
    global.$gameSwitches = new Game_Switches()
    global.$gameVariables = new Game_Variables()
    global.$gameSelfSwitches = new Game_SelfSwitches()
    global.$gameActors = new Game_Actors()
    global.$gameParty = new Game_Party()
    global.$gameTroop = new Game_Troop()
    global.$gameMap = new Game_Map()
    global.$gamePlayer = new Game_Player()
  }

  static setupNewGame() {
    this.createGameObjects()
    this.selectSavefileForNewGame()
    global.$gameParty.setupStartingMembers()
    global.$gamePlayer.reserveTransfer(global.$dataSystem.startMapId,
      global.$dataSystem.startX, global.$dataSystem.startY)
    Graphics.frameCount = 0
  }

  static setupBattleTest() {
    this.createGameObjects()
    global.$gameParty.setupBattleTest()
    BattleManager.setup(global.$dataSystem.testTroopId, true, false)
    BattleManager.setBattleTest(true)
    BattleManager.playBattleBgm()
  }

  static setupEventTest() {
    this.createGameObjects()
    this.selectSavefileForNewGame()
    global.$gameParty.setupStartingMembers()
    global.$gamePlayer.reserveTransfer(-1, 8, 6)
    global.$gamePlayer.setTransparent(false)
  }

  static loadGlobalInfo() {
    let json
    try {
      json = StorageManager.load(0)
    } catch (e) {
      console.error(e)
      return []
    }
    if (json) {
      const globalInfo = JSON.parse(json)
      for (let i = 1; i <= this.maxSavefiles(); i++) {
        if (!StorageManager.exists(i)) {
          delete globalInfo[i]
        }
      }
      return globalInfo
    } else {
      return []
    }
  }

  static saveGlobalInfo(info) {
    StorageManager.save(0, JSON.stringify(info))
  }

  static isThisGameFile(savefileId) {
    const globalInfo = this.loadGlobalInfo()
    if (globalInfo && globalInfo[savefileId]) {
      if (StorageManager.isLocalMode()) {
        return true
      } else {
        const savefile = globalInfo[savefileId]
        return (savefile.globalId === this._globalId &&
          savefile.title === global.$dataSystem.gameTitle)
      }
    } else {
      return false
    }
  }

  static isAnySavefileExists() {
    const globalInfo = this.loadGlobalInfo()
    if (globalInfo) {
      for (let i = 1; i < globalInfo.length; i++) {
        if (this.isThisGameFile(i)) {
          return true
        }
      }
    }
    return false
  }

  static latestSavefileId() {
    const globalInfo = this.loadGlobalInfo()
    let savefileId = 1
    let timestamp = 0
    if (globalInfo) {
      for (let i = 1; i < globalInfo.length; i++) {
        if (this.isThisGameFile(i) && globalInfo[i].timestamp > timestamp) {
          timestamp = globalInfo[i].timestamp
          savefileId = i
        }
      }
    }
    return savefileId
  }

  static loadAllSavefileImages() {
    const globalInfo = this.loadGlobalInfo()
    if (globalInfo) {
      for (let i = 1; i < globalInfo.length; i++) {
        if (this.isThisGameFile(i)) {
          const info = globalInfo[i]
          this.loadSavefileImages(info)
        }
      }
    }
  }

  static loadSavefileImages(info) {
    if (info.characters) {
      for (let i = 0; i < info.characters.length; i++) {
        ImageManager.reserveCharacter(info.characters[i][0])
      }
    }
    if (info.faces) {
      for (let j = 0; j < info.faces.length; j++) {
        ImageManager.reserveFace(info.faces[j][0])
      }
    }
  }

  static maxSavefiles() {
    return 20
  }

  static saveGame(savefileId) {
    try {
      StorageManager.backup(savefileId)
      return this.saveGameWithoutRescue(savefileId)
    } catch (e) {
      console.error(e)
      try {
        StorageManager.remove(savefileId)
        StorageManager.restoreBackup(savefileId)
      } catch (e2) {
        // ignore
      }
      return false
    }
  }

  static loadGame(savefileId) {
    try {
      return this.loadGameWithoutRescue(savefileId)
    } catch (e) {
      console.error(e)
      return false
    }
  }

  static loadSavefileInfo(savefileId) {
    const globalInfo = this.loadGlobalInfo()
    return (globalInfo && globalInfo[savefileId]) ? globalInfo[savefileId] : null
  }

  static lastAccessedSavefileId() {
    return this._lastAccessedId
  }

  static saveGameWithoutRescue(savefileId) {
    const json = JsonEx.stringify(this.makeSaveContents())
    if (json.length >= 200000) {
      console.warn('Save data too big!')
    }
    StorageManager.save(savefileId, json)
    this._lastAccessedId = savefileId
    const globalInfo = this.loadGlobalInfo() || []
    globalInfo[savefileId] = this.makeSavefileInfo()
    this.saveGlobalInfo(globalInfo)
    return true
  }

  static loadGameWithoutRescue(savefileId) {
    const globalInfo = this.loadGlobalInfo()
    if (this.isThisGameFile(savefileId)) {
      const json = StorageManager.load(savefileId)
      this.createGameObjects()
      this.extractSaveContents(JsonEx.parse(json))
      this._lastAccessedId = savefileId
      return true
    } else {
      return false
    }
  }

  static selectSavefileForNewGame() {
    const globalInfo = this.loadGlobalInfo()
    this._lastAccessedId = 1
    if (globalInfo) {
      const numSavefiles = Math.max(0, globalInfo.length - 1)
      if (numSavefiles < this.maxSavefiles()) {
        this._lastAccessedId = numSavefiles + 1
      } else {
        let timestamp = Number.MAX_VALUE
        for (let i = 1; i < globalInfo.length; i++) {
          if (!globalInfo[i]) {
            this._lastAccessedId = i
            break
          }
          if (globalInfo[i].timestamp < timestamp) {
            timestamp = globalInfo[i].timestamp
            this._lastAccessedId = i
          }
        }
      }
    }
  }

  static makeSavefileInfo() {
    const info: Record<string, any> = {}
    info.globalId = this._globalId
    info.title = global.$dataSystem.gameTitle
    info.characters = global.$gameParty.charactersForSavefile()
    info.faces = global.$gameParty.facesForSavefile()
    info.playtime = global.$gameSystem.playtimeText()
    info.timestamp = Date.now()
    return info
  }

  static makeSaveContents() {
    // A save data does not contain global.$gameTemp, global.$gameMessage, and global.$gameTroop.
    const contents: Record<string, any> = {}
    contents.system = global.$gameSystem
    contents.screen = global.$gameScreen
    contents.timer = global.$gameTimer
    contents.switches = global.$gameSwitches
    contents.variables = global.$gameVariables
    contents.selfSwitches = global.$gameSelfSwitches
    contents.actors = global.$gameActors
    contents.party = global.$gameParty
    contents.map = global.$gameMap
    contents.player = global.$gamePlayer
    return contents
  }

  static extractSaveContents(contents) {
    global.$gameSystem = contents.system
    global.$gameScreen = contents.screen
    global.$gameTimer = contents.timer
    global.$gameSwitches = contents.switches
    global.$gameVariables = contents.variables
    global.$gameSelfSwitches = contents.selfSwitches
    global.$gameActors = contents.actors
    global.$gameParty = contents.party
    global.$gameMap = contents.map
    global.$gamePlayer = contents.player
  }
}
