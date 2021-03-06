import {Sprite_Base} from './Sprite_Base'
import {Sprite_Damage} from './Sprite_Damage'
import {Game_Battler} from '../objects/Game_Battler'

// Sprite_Battler
//
// The superclass of Sprite_Actor and Sprite_Enemy.
export abstract class Sprite_Battler extends Sprite_Base {

  private _battler!: Game_Battler | null
  private _damages: Sprite_Damage[] = []
  private _homeX = 0
  private _homeY = 0
  private _offsetX = 0
  private _offsetY = 0
  private _targetOffsetX = NaN
  private _targetOffsetY = NaN
  private _movementDuration = 0
  private _selectionEffectCount = 0

  protected constructor(battler?: Game_Battler) {
    super()
    this.anchor.x = 0.5
    this.anchor.y = 1
    this.setBattler(battler || null)
  }

  setBattler(battler: Game_Battler | null) {
    this._battler = battler
  }

  setHome(x: number, y: number) {
    this._homeX = x
    this._homeY = y
    this.updatePosition()
  }

  override update() {
    super.update()
    if (this._battler) {
      this.updateMain()
      this.updateAnimation()
      this.updateDamagePopup()
      this.updateSelectionEffect()
    } else {
      this.bitmap = null
    }
  }

  override updateVisibility() {
    super.updateVisibility()
    if (!this._battler || !this._battler.isSpriteVisible()) {
      this.visible = false
    }
  }

  updateMain() {
    if (this._battler?.isSpriteVisible()) {
      this.updateBitmap()
      this.updateFrame()
    }
    this.updateMove()
    this.updatePosition()
  }

  abstract updateBitmap()

  abstract updateFrame()

  updateMove() {
    if (this._movementDuration > 0) {
      const d = this._movementDuration
      this._offsetX = (this._offsetX * (d - 1) + this._targetOffsetX) / d
      this._offsetY = (this._offsetY * (d - 1) + this._targetOffsetY) / d
      this._movementDuration--
      if (this._movementDuration === 0) {
        this.onMoveEnd()
      }
    }
  }

  updatePosition() {
    this.x = this._homeX + this._offsetX
    this.y = this._homeY + this._offsetY
  }

  updateAnimation() {
    this.setupAnimation()
  }

  updateDamagePopup() {
    this.setupDamagePopup()
    if (this._damages.length > 0) {
      for (let i = 0; i < this._damages.length; i++) {
        this._damages[i].update()
      }
      if (!this._damages[0].isPlaying()) {
        this.parent.removeChild(this._damages[0])
        this._damages.shift()
      }
    }
  }

  updateSelectionEffect() {
    const target = this._effectTarget
    if (this._battler?.isSelected()) {
      this._selectionEffectCount++
      if (this._selectionEffectCount % 30 < 15) {
        target.setBlendColor([255, 255, 255, 64])
      } else {
        target.setBlendColor([0, 0, 0, 0])
      }
    } else if (this._selectionEffectCount > 0) {
      this._selectionEffectCount = 0
      target.setBlendColor([0, 0, 0, 0])
    }
  }

  setupAnimation() {
    while (this._battler?.isAnimationRequested()) {
      const data = this._battler.shiftAnimation()!
      const animation = global.$dataAnimations[data.animationId]
      const mirror = data.mirror
      const delay = animation.position === 3 ? 0 : data.delay
      this.startAnimation(animation, mirror, delay)
      for (let i = 0; i < this._animationSprites.length; i++) {
        const sprite = this._animationSprites[i]
        sprite.visible = this._battler.isSpriteVisible()
      }
    }
  }

  setupDamagePopup() {
    if (this._battler?.isDamagePopupRequested()) {
      if (this._battler.isSpriteVisible()) {
        const sprite = new Sprite_Damage()
        sprite.x = this.x + this.damageOffsetX()
        sprite.y = this.y + this.damageOffsetY()
        sprite.setup(this._battler)
        this._damages.push(sprite)
        this.parent.addChild(sprite)
      }
      this._battler.clearDamagePopup()
      this._battler.clearResult()
    }
  }

  damageOffsetX() {
    return 0
  }

  damageOffsetY() {
    return 0
  }

  startMove(x: number, y: number, duration: number) {
    if (this._targetOffsetX !== x || this._targetOffsetY !== y) {
      this._targetOffsetX = x
      this._targetOffsetY = y
      this._movementDuration = duration
      if (duration === 0) {
        this._offsetX = x
        this._offsetY = y
      }
    }
  }

  onMoveEnd() {
    // empty
  }

  isEffecting() {
    return false
  }

  isMoving() {
    return this._movementDuration > 0
  }

  inHomePosition() {
    return this._offsetX === 0 && this._offsetY === 0
  }
}
