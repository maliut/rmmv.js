import {Scene_Base} from './Scene_Base'
import {DataManager, global} from '../managers/DataManager'
import {TouchInput} from '../core/TouchInput'
import {BattleManager} from '../managers/BattleManager'
import {ImageManager} from '../managers/ImageManager'
import {SoundManager} from '../managers/SoundManager'
import {AudioManager} from '../managers/AudioManager'
import {Input} from '../core/Input'
import {SceneManager} from '../managers/SceneManager'
import {Scene_Title} from './Scene_Title'
import {Scene_Load} from './Scene_Load'
import {Scene_Battle} from './Scene_Battle'
import {Scene_Gameover} from './Scene_Gameover'
import {Spriteset_Map} from '../sprites/Spriteset_Map'
import {Scene_Menu} from './Scene_Menu'
import {Scene_Debug} from './Scene_Debug'

// Scene_Map
//
// The scene class of the map screen.
export class Scene_Map extends Scene_Base {

  private _waitCount = 0
  private _encounterEffectDuration = 0
  private _mapLoaded = false
  private _touchCount = 0
  private _transfer
  private _mapNameWindow
  private _messageWindow
  private _spriteset
  private _scrollTextWindow
  menuCalling

  override create() {
    super.create()
    this._transfer = global.$gamePlayer.isTransferring()
    const mapId = this._transfer ? global.$gamePlayer.newMapId() : global.$gameMap.mapId()
    DataManager.loadMapData(mapId)
  }

  override isReady() {
    if (!this._mapLoaded && DataManager.isMapLoaded()) {
      this.onMapLoaded()
      this._mapLoaded = true
    }
    return this._mapLoaded && super.isReady()
  }

  onMapLoaded() {
    if (this._transfer) {
      global.$gamePlayer.performTransfer()
    }
    this.createDisplayObjects()
  }

  override start() {
    super.start()
    SceneManager.clearStack()
    if (this._transfer) {
      this.fadeInForTransfer()
      this._mapNameWindow.open()
      global.$gameMap.autoplay()
    } else if (this.needsFadeIn()) {
      this.startFadeIn(this.fadeSpeed(), false)
    }
    this.menuCalling = false
  }

  override update() {
    this.updateDestination()
    this.updateMainMultiply()
    if (this.isSceneChangeOk()) {
      this.updateScene()
    } else if (SceneManager.isNextScene(Scene_Battle)) {
      this.updateEncounterEffect()
    }
    this.updateWaitCount()
    super.update()
  }

  updateMainMultiply() {
    this.updateMain()
    if (this.isFastForward()) {
      this.updateMain()
    }
  }

  updateMain() {
    const active = this.isActive()
    global.$gameMap.update(active)
    global.$gamePlayer.update(active)
    global.$gameTimer.update(active)
    global.$gameScreen.update()
  }

  isFastForward() {
    return (global.$gameMap.isEventRunning() && !SceneManager.isSceneChanging() &&
      (Input.isLongPressed('ok') || TouchInput.isLongPressed()))
  }

  override stop() {
    super.stop()
    global.$gamePlayer.straighten()
    this._mapNameWindow.close()
    if (this.needsSlowFadeOut()) {
      this.startFadeOut(this.slowFadeSpeed(), false)
    } else if (SceneManager.isNextScene(Scene_Map)) {
      this.fadeOutForTransfer()
    } else if (SceneManager.isNextScene(Scene_Battle)) {
      this.launchBattle()
    }
  }

  override isBusy() {
    return ((this._messageWindow && this._messageWindow.isClosing()) ||
      this._waitCount > 0 || this._encounterEffectDuration > 0 ||
      super.isBusy())
  }

  override terminate() {
    super.terminate()
    if (!SceneManager.isNextScene(Scene_Battle)) {
      this._spriteset.update()
      this._mapNameWindow.hide()
      SceneManager.snapForBackground()
    } else {
      ImageManager.clearRequest()
    }

    if (SceneManager.isNextScene(Scene_Map)) {
      ImageManager.clearRequest()
    }

    global.$gameScreen.clearZoom()

    this.removeChild(this._fadeSprite)
    this.removeChild(this._mapNameWindow)
    this.removeChild(this._windowLayer)
    this.removeChild(this._spriteset)
  }

  needsFadeIn() {
    return (SceneManager.isPreviousScene(Scene_Battle) ||
      SceneManager.isPreviousScene(Scene_Load))
  }

  needsSlowFadeOut() {
    return (SceneManager.isNextScene(Scene_Title) ||
      SceneManager.isNextScene(Scene_Gameover))
  }

  updateWaitCount() {
    if (this._waitCount > 0) {
      this._waitCount--
      return true
    }
    return false
  }

  updateDestination() {
    if (this.isMapTouchOk()) {
      this.processMapTouch()
    } else {
      global.$gameTemp.clearDestination()
      this._touchCount = 0
    }
  }

  isMapTouchOk() {
    return this.isActive() && global.$gamePlayer.canMove()
  }

  processMapTouch() {
    if (TouchInput.isTriggered() || this._touchCount > 0) {
      if (TouchInput.isPressed()) {
        if (this._touchCount === 0 || this._touchCount >= 15) {
          const x = global.$gameMap.canvasToMapX(TouchInput.x)
          const y = global.$gameMap.canvasToMapY(TouchInput.y)
          global.$gameTemp.setDestination(x, y)
        }
        this._touchCount++
      } else {
        this._touchCount = 0
      }
    }
  }

  isSceneChangeOk() {
    return this.isActive() && !global.$gameMessage.isBusy()
  }

  updateScene() {
    this.checkGameover()
    if (!SceneManager.isSceneChanging()) {
      this.updateTransferPlayer()
    }
    if (!SceneManager.isSceneChanging()) {
      this.updateEncounter()
    }
    if (!SceneManager.isSceneChanging()) {
      this.updateCallMenu()
    }
    if (!SceneManager.isSceneChanging()) {
      this.updateCallDebug()
    }
  }

  createDisplayObjects() {
    this.createSpriteset()
    this.createMapNameWindow()
    this.createWindowLayer()
    this.createAllWindows()
  }

  createSpriteset() {
    this._spriteset = new Spriteset_Map()
    this.addChild(this._spriteset)
  }

  createAllWindows() {
    this.createMessageWindow()
    this.createScrollTextWindow()
  }

  createMapNameWindow() {
    this._mapNameWindow = new Window_MapName()
    this.addChild(this._mapNameWindow)
  }

  createMessageWindow() {
    this._messageWindow = new Window_Message()
    this.addWindow(this._messageWindow)
    this._messageWindow.subWindows().forEach(function (window) {
      this.addWindow(window)
    }, this)
  }

  createScrollTextWindow() {
    this._scrollTextWindow = new Window_ScrollText()
    this.addWindow(this._scrollTextWindow)
  }

  updateTransferPlayer() {
    if (global.$gamePlayer.isTransferring()) {
      SceneManager.goto(Scene_Map)
    }
  }

  updateEncounter() {
    if (global.$gamePlayer.executeEncounter()) {
      SceneManager.push(Scene_Battle)
    }
  }

  updateCallMenu() {
    if (this.isMenuEnabled()) {
      if (this.isMenuCalled()) {
        this.menuCalling = true
      }
      if (this.menuCalling && !global.$gamePlayer.isMoving()) {
        this.callMenu()
      }
    } else {
      this.menuCalling = false
    }
  }

  isMenuEnabled() {
    return global.$gameSystem.isMenuEnabled() && !global.$gameMap.isEventRunning()
  }

  isMenuCalled() {
    return Input.isTriggered('menu') || TouchInput.isCancelled()
  }

  callMenu() {
    SoundManager.playOk()
    SceneManager.push(Scene_Menu)
    Window_MenuCommand.initCommandPosition()
    global.$gameTemp.clearDestination()
    this._mapNameWindow.hide()
    this._waitCount = 2
  }

  updateCallDebug() {
    if (this.isDebugCalled()) {
      SceneManager.push(Scene_Debug)
    }
  }

  isDebugCalled() {
    return Input.isTriggered('debug') && global.$gameTemp.isPlaytest()
  }

  fadeInForTransfer() {
    const fadeType = global.$gamePlayer.fadeType()
    switch (fadeType) {
    case 0:
    case 1:
      this.startFadeIn(this.fadeSpeed(), fadeType === 1)
      break
    }
  }

  fadeOutForTransfer() {
    const fadeType = global.$gamePlayer.fadeType()
    switch (fadeType) {
    case 0:
    case 1:
      this.startFadeOut(this.fadeSpeed(), fadeType === 1)
      break
    }
  }

  launchBattle() {
    BattleManager.saveBgmAndBgs()
    this.stopAudioOnBattleStart()
    SoundManager.playBattleStart()
    this.startEncounterEffect()
    this._mapNameWindow.hide()
  }

  stopAudioOnBattleStart() {
    if (!AudioManager.isCurrentBgm(global.$gameSystem.battleBgm())) {
      AudioManager.stopBgm()
    }
    AudioManager.stopBgs()
    AudioManager.stopMe()
    AudioManager.stopSe()
  }

  startEncounterEffect() {
    this._spriteset.hideCharacters()
    this._encounterEffectDuration = this.encounterEffectSpeed()
  }

  updateEncounterEffect() {
    if (this._encounterEffectDuration > 0) {
      this._encounterEffectDuration--
      const speed = this.encounterEffectSpeed()
      const n = speed - this._encounterEffectDuration
      const p = n / speed
      const q = ((p - 1) * 20 * p + 5) * p + 1
      const zoomX = global.$gamePlayer.screenX()
      const zoomY = global.$gamePlayer.screenY() - 24
      if (n === 2) {
        global.$gameScreen.setZoom(zoomX, zoomY, 1)
        this.snapForBattleBackground()
        this.startFlashForEncounter(speed / 2)
      }
      global.$gameScreen.setZoom(zoomX, zoomY, q)
      if (n === Math.floor(speed / 6)) {
        this.startFlashForEncounter(speed / 2)
      }
      if (n === Math.floor(speed / 2)) {
        BattleManager.playBattleBgm()
        this.startFadeOut(this.fadeSpeed())
      }
    }
  }

  snapForBattleBackground() {
    this._windowLayer.visible = false
    SceneManager.snapForBackground()
    this._windowLayer.visible = true
  }

  startFlashForEncounter(duration) {
    const color = [255, 255, 255, 255]
    global.$gameScreen.startFlash(color, duration)
  }

  encounterEffectSpeed() {
    return 60
  }
}
