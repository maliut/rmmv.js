import {Sprite_Base} from './Sprite_Base'
import {ImageManager} from '../managers/ImageManager'
import {Game_Battler} from '../objects/Game_Battler'

// Sprite_StateOverlay
//
// The sprite for displaying an overlay image for a state.
export class Sprite_StateOverlay extends Sprite_Base {

  private _battler: Game_Battler | null = null
  private _overlayIndex = 0
  private _animationCount = 0
  private _pattern = 0

  constructor() {
    super()
    this.anchor.x = 0.5
    this.anchor.y = 1
    this.loadBitmap()
  }

  loadBitmap() {
    this.bitmap = ImageManager.loadSystem('States')
    this.setFrame(0, 0, 0, 0)
  }

  setup(battler: Game_Battler | null) {
    this._battler = battler
  }

  override update() {
    super.update()
    this._animationCount++
    if (this._animationCount >= this.animationWait()) {
      this.updatePattern()
      this.updateFrame()
      this._animationCount = 0
    }
  }

  animationWait() {
    return 8
  }

  updatePattern() {
    this._pattern++
    this._pattern %= 8
    if (this._battler) {
      this._overlayIndex = this._battler.stateOverlayIndex()
    }
  }

  updateFrame() {
    if (this._overlayIndex > 0) {
      const w = 96
      const h = 96
      const sx = this._pattern * w
      const sy = (this._overlayIndex - 1) * h
      this.setFrame(sx, sy, w, h)
    } else {
      this.setFrame(0, 0, 0, 0)
    }
  }
}
