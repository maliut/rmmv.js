import {Sprite} from '../core/Sprite'
import {Sprite_Animation} from './Sprite_Animation'

// Sprite_Base
//
// The sprite class with a feature which displays animations.
export class Sprite_Base extends Sprite {

  protected _animationSprites = []
  protected _effectTarget = this
  private _hiding = false

  override update() {
    super.update()
    this.updateVisibility()
    this.updateAnimationSprites()
  }

  hide() {
    this._hiding = true
    this.updateVisibility()
  }

  show() {
    this._hiding = false
    this.updateVisibility()
  }

  updateVisibility() {
    this.visible = !this._hiding
  }

  updateAnimationSprites() {
    if (this._animationSprites.length > 0) {
      const sprites = this._animationSprites.clone()
      this._animationSprites = []
      for (let i = 0; i < sprites.length; i++) {
        const sprite = sprites[i]
        if (sprite.isPlaying()) {
          this._animationSprites.push(sprite)
        } else {
          sprite.remove()
        }
      }
    }
  }

  startAnimation(animation, mirror, delay) {
    const sprite = new Sprite_Animation()
    sprite.setup(this._effectTarget, animation, mirror, delay)
    this.parent.addChild(sprite)
    this._animationSprites.push(sprite)
  }

  isAnimationPlaying() {
    return this._animationSprites.length > 0
  }
}
