import {Window_Base} from './Window_Base'
import {Graphics} from '../core/Graphics'
import {Data_ItemBase} from '../types/global'

// Window_Help
//
// The window for displaying the description of the selected item.
export class Window_Help extends Window_Base {

  private _text = ''

  override initialize(numLines = 2) {
    const width = Graphics.boxWidth
    const height = this.fittingHeight(numLines)
    super.initialize(0, 0, width, height)
    return this
  }

  setText(text: string) {
    if (this._text !== text) {
      this._text = text
      this.refresh()
    }
  }

  clear() {
    this.setText('')
  }

  setItem(item: Data_ItemBase | null) {
    this.setText(item ? item.description : '')
  }

  refresh() {
    this.contents.clear()
    this.drawTextEx(this._text, this.textPadding(), 0)
  }
}
