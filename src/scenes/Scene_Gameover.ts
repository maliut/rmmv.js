import {Scene_Base} from './Scene_Base'
import {global} from '../managers/DataManager'
import {AudioManager} from '../managers/AudioManager'
import {Sprite} from '../core/Sprite'
import {ImageManager} from '../managers/ImageManager'
import {Input} from '../core/Input'
import {TouchInput} from '../core/TouchInput'
import {SceneManager} from '../managers/SceneManager'
import {Scene_Title} from './Scene_Title'

// Scene_Gameover
//
// The scene class of the game over screen.
export class Scene_Gameover extends Scene_Base {

  private _backSprite!: Sprite

  override create() {
    super.create()
    this.playGameoverMusic()
    this.createBackground()
  }

  override start() {
    super.start()
    this.startFadeIn(this.slowFadeSpeed(), false)
  }

  override update() {
    if (this.isActive() && !this.isBusy() && this.isTriggered()) {
      this.gotoTitle()
    }
    super.update()
  }

  override stop() {
    super.stop()
    this.fadeOutAll()
  }

  override terminate() {
    super.terminate()
    AudioManager.stopAll()
  }

  playGameoverMusic() {
    AudioManager.stopBgm()
    AudioManager.stopBgs()
    AudioManager.playMe(global.$dataSystem.gameoverMe)
  }

  createBackground() {
    this._backSprite = new Sprite()
    this._backSprite.bitmap = ImageManager.loadSystem('GameOver')
    this.addChild(this._backSprite)
  }

  isTriggered() {
    return Input.isTriggered('ok') || TouchInput.isTriggered()
  }

  gotoTitle() {
    SceneManager.goto(Scene_Title)
  }
}
