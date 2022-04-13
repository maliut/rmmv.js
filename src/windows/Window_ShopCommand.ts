import {Window_HorzCommand} from './Window_HorzCommand'
import {TextManager} from '../managers/TextManager'

// Window_ShopCommand
//
// The window for selecting buy/sell on the shop screen.
export class Window_ShopCommand extends Window_HorzCommand {

  private readonly _windowWidth
  private readonly _purchaseOnly

  constructor(width, purchaseOnly) {
    super()
    this._windowWidth = width
    this._purchaseOnly = purchaseOnly
  }

  override initialize() {
    super.initialize(0, 0)
    return this
  }

  override windowWidth() {
    return this._windowWidth
  }

  override maxCols() {
    return 3
  }

  override makeCommandList() {
    this.addCommand(TextManager.buy, 'buy')
    this.addCommand(TextManager.sell, 'sell', !this._purchaseOnly)
    this.addCommand(TextManager.cancel, 'cancel')
  }
}
