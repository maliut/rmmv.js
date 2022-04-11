import {Scene_Base} from './Scene_Base'
import {SceneManager} from '../managers/SceneManager'
import {Sprite} from '../core/Sprite'
import {ImageManager} from '../managers/ImageManager'
import {Bitmap} from '../core/Bitmap'
import {Graphics} from '../core/Graphics'
import {DataManager} from '../managers/DataManager'
import {AudioManager} from '../managers/AudioManager'
import {global} from '../managers/DataManager'
import {Scene_Map} from './Scene_Map'
import {Scene_Load} from './Scene_Load'
import {Scene_Options} from './Scene_Options'

// Scene_Title
//
// The scene class of the title screen.
export class Scene_Title extends Scene_Base {

  private _backSprite1
  private _backSprite2
  private _commandWindow
  private _gameTitleSprite

  override create() {
    super.create()
    this.createBackground()
    this.createForeground()
    this.createWindowLayer()
    this.createCommandWindow()
  }

  override start() {
    super.start()
    SceneManager.clearStack()
    this.centerSprite(this._backSprite1)
    this.centerSprite(this._backSprite2)
    this.playTitleMusic()
    this.startFadeIn(this.fadeSpeed(), false)
  }

  override update() {
    if (!this.isBusy()) {
      this._commandWindow.open()
    }
    super.update()
  }

  override isBusy() {
    return this._commandWindow.isClosing() || super.isBusy()
  }

  override terminate() {
    super.terminate()
    SceneManager.snapForBackground()
  }

  createBackground() {
    this._backSprite1 = new Sprite(ImageManager.loadTitle1(global.$dataSystem.title1Name))
    this._backSprite2 = new Sprite(ImageManager.loadTitle2(global.$dataSystem.title2Name))
    this.addChild(this._backSprite1)
    this.addChild(this._backSprite2)
  }

  createForeground() {
    this._gameTitleSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height))
    this.addChild(this._gameTitleSprite)
    if (global.$dataSystem.optDrawTitle) {
      this.drawGameTitle()
    }
  }

  drawGameTitle() {
    const x = 20
    const y = Graphics.height / 4
    const maxWidth = Graphics.width - x * 2
    const text = global.$dataSystem.gameTitle
    this._gameTitleSprite.bitmap.outlineColor = 'black'
    this._gameTitleSprite.bitmap.outlineWidth = 8
    this._gameTitleSprite.bitmap.fontSize = 72
    this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center')
  }

  centerSprite(sprite) {
    sprite.x = Graphics.width / 2
    sprite.y = Graphics.height / 2
    sprite.anchor.x = 0.5
    sprite.anchor.y = 0.5
  }

  createCommandWindow() {
    this._commandWindow = new Window_TitleCommand()
    this._commandWindow.setHandler('newGame', this.commandNewGame.bind(this))
    this._commandWindow.setHandler('continue', this.commandContinue.bind(this))
    this._commandWindow.setHandler('options', this.commandOptions.bind(this))
    this.addWindow(this._commandWindow)
  }

  commandNewGame() {
    DataManager.setupNewGame()
    this._commandWindow.close()
    this.fadeOutAll()
    SceneManager.goto(Scene_Map)
  }

  commandContinue() {
    this._commandWindow.close()
    SceneManager.push(Scene_Load)
  }

  commandOptions() {
    this._commandWindow.close()
    SceneManager.push(Scene_Options)
  }

  playTitleMusic() {
    AudioManager.playBgm(global.$dataSystem.titleBgm)
    AudioManager.stopBgs()
    AudioManager.stopMe()
  }
}
