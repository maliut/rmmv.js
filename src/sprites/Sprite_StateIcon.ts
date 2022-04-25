import {Sprite} from '../core/Sprite'
import {ImageManager} from '../managers/ImageManager'
import {Game_Battler} from '../objects/Game_Battler'

// Sprite_StateIcon
//
// The sprite for displaying state icons.
export class Sprite_StateIcon extends Sprite {

  private static _iconWidth = 32
  private static _iconHeight = 32

  private _battler!: Game_Battler
  private _iconIndex = 0
  private _animationCount = 0
  private _animationIndex = 0

  constructor() {
    super()
    this.anchor.x = 0.5
    this.anchor.y = 0.5
    this.loadBitmap()
  }

  loadBitmap() {
    this.bitmap = ImageManager.loadSystem('IconSet')
    this.setFrame(0, 0, 0, 0)
  }

  setup(battler: Game_Battler) {
    this._battler = battler
  }

  override update() {
    super.update()
    this._animationCount++
    if (this._animationCount >= this.animationWait()) {
      this.updateIcon()
      this.updateFrame()
      this._animationCount = 0
    }
  }

  animationWait() {
    return 40
  }

  updateIcon() {
    let icons: number[] = []
    if (this._battler && this._battler.isAlive()) {
      icons = this._battler.allIcons()
    }
    if (icons.length > 0) {
      this._animationIndex++
      if (this._animationIndex >= icons.length) {
        this._animationIndex = 0
      }
      this._iconIndex = icons[this._animationIndex]
    } else {
      this._animationIndex = 0
      this._iconIndex = 0
    }
  }

  updateFrame() {
    const pw = Sprite_StateIcon._iconWidth
    const ph = Sprite_StateIcon._iconHeight
    const sx = this._iconIndex % 16 * pw
    const sy = Math.floor(this._iconIndex / 16) * ph
    this.setFrame(sx, sy, pw, ph)
  }
}
