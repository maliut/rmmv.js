import './core/JsExtensions'
// import {PluginManager} from './managers/PluginManager'
import {SceneManager} from './managers/SceneManager'
import {Scene_Boot} from './scenes/Scene_Boot'

// useless
// PluginManager.setup([])

window.onload = function() {
  SceneManager.run(Scene_Boot)
}
