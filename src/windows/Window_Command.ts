import {Window_Selectable} from './Window_Selectable'

// Window_Command
//
// The superclass of windows for selecting a command.
export class Window_Command extends Window_Selectable {

  private _list = []

  override initialize(x, y) {
    this.clearCommandList()
    this.makeCommandList()
    const width = this.windowWidth()
    const height = this.windowHeight()
    super.initialize(x, y, width, height)
    this.refresh()
    this.select(0)
    this.activate()
    return this
  }

  windowWidth() {
    return 240
  }

  windowHeight() {
    return this.fittingHeight(this.numVisibleRows())
  }

  numVisibleRows() {
    return Math.ceil(this.maxItems() / this.maxCols())
  }

  override maxItems() {
    return this._list.length
  }

  clearCommandList() {
    this._list = []
  }

  makeCommandList() {
    // empty
  }

  addCommand(name, symbol, enabled = true, ext = null) {
    this._list.push({name: name, symbol: symbol, enabled: enabled, ext: ext})
  }

  commandName(index) {
    return this._list[index].name
  }

  commandSymbol(index) {
    return this._list[index].symbol
  }

  isCommandEnabled(index) {
    return this._list[index].enabled
  }

  currentData() {
    return this.index() >= 0 ? this._list[this.index()] : null
  }

  override isCurrentItemEnabled() {
    return this.currentData() ? this.currentData().enabled : false
  }

  currentSymbol() {
    return this.currentData() ? this.currentData().symbol : null
  }

  currentExt() {
    return this.currentData() ? this.currentData().ext : null
  }

  findSymbol(symbol) {
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].symbol === symbol) {
        return i
      }
    }
    return -1
  }

  selectSymbol(symbol) {
    const index = this.findSymbol(symbol)
    if (index >= 0) {
      this.select(index)
    } else {
      this.select(0)
    }
  }

  findExt(ext) {
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].ext === ext) {
        return i
      }
    }
    return -1
  }

  selectExt(ext) {
    const index = this.findExt(ext)
    if (index >= 0) {
      this.select(index)
    } else {
      this.select(0)
    }
  }

  override drawItem(index) {
    const rect = this.itemRectForText(index)
    const align = this.itemTextAlign()
    this.resetTextColor()
    this.changePaintOpacity(this.isCommandEnabled(index))
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align)
  }

  itemTextAlign() {
    return 'left'
  }

  override isOkEnabled() {
    return true
  }

  override callOkHandler() {
    const symbol = this.currentSymbol()
    if (this.isHandled(symbol)) {
      this.callHandler(symbol)
    } else if (this.isHandled('ok')) {
      super.callOkHandler()
    } else {
      this.activate()
    }
  }

  override refresh() {
    this.clearCommandList()
    this.makeCommandList()
    this.createContents()
    super.refresh()
  }
}
