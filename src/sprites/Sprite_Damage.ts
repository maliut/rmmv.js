import {Sprite} from '../core/Sprite'
import {ImageManager} from '../managers/ImageManager'
import { Game_Battler } from '../objects/Game_Battler'

// Sprite_Damage
//
// The sprite for displaying a popup damage.
export class Sprite_Damage extends Sprite {

  private _duration = 90
  private _flashColor = [0, 0, 0, 0]
  private _flashDuration = 0
  private _damageBitmap = ImageManager.loadSystem('Damage')

  setup(target: Game_Battler) {
    const result = target.result()
    if (result.missed || result.evaded) {
      this.createMiss()
    } else if (result.hpAffected) {
      this.createDigits(0, result.hpDamage)
    } else if (target.isAlive() && result.mpDamage !== 0) {
      this.createDigits(2, result.mpDamage)
    }
    if (result.critical) {
      this.setupCriticalEffect()
    }
  }

  setupCriticalEffect() {
    this._flashColor = [255, 0, 0, 160]
    this._flashDuration = 60
  }

  digitWidth() {
    return this._damageBitmap ? this._damageBitmap.width / 10 : 0
  }

  digitHeight() {
    return this._damageBitmap ? this._damageBitmap.height / 5 : 0
  }

  createMiss() {
    const w = this.digitWidth()
    const h = this.digitHeight()
    const sprite = this.createChildSprite()
    sprite.setFrame(0, 4 * h, 4 * w, h)
    sprite.dy = 0
  }

  createDigits(baseRow: number, value: number) {
    const string = Math.abs(value).toString()
    const row = baseRow + (value < 0 ? 1 : 0)
    const w = this.digitWidth()
    const h = this.digitHeight()
    for (let i = 0; i < string.length; i++) {
      const sprite = this.createChildSprite()
      const n = Number(string[i])
      sprite.setFrame(n * w, row * h, w, h)
      sprite.x = (i - (string.length - 1) / 2) * w
      sprite.dy = -i
    }
  }

  createChildSprite() {
    const sprite = new Sprite()
    sprite.bitmap = this._damageBitmap
    sprite.anchor.x = 0.5
    sprite.anchor.y = 1
    sprite.y = -40
    sprite.ry = sprite.y
    this.addChild(sprite)
    return sprite
  }

  override update() {
    super.update()
    if (this._duration > 0) {
      this._duration--
      for (let i = 0; i < this.children.length; i++) {
        this.updateChild(this.children[i] as Sprite)
      }
    }
    this.updateFlash()
    this.updateOpacity()
  }

  updateChild(sprite: Sprite) {
    sprite.dy += 0.5
    sprite.ry += sprite.dy
    if (sprite.ry >= 0) {
      sprite.ry = 0
      sprite.dy *= -0.6
    }
    sprite.y = Math.round(sprite.ry)
    sprite.setBlendColor(this._flashColor)
  }

  updateFlash() {
    if (this._flashDuration > 0) {
      const d = this._flashDuration--
      this._flashColor[3] *= (d - 1) / d
    }
  }

  updateOpacity() {
    if (this._duration < 10) {
      this.opacity = 255 * this._duration / 10
    }
  }

  isPlaying() {
    return this._duration > 0
  }
}
