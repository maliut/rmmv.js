# rmmv.js - RPG Maker MV 脚本工程化改造

使用 Webpack、TypeScript 等现代前端工具对 RPG Maker MV 的默认脚本进行重构改造，使之更易于理解和二次开发。

RPG Maker MV 使用 JavaScript 作为脚本语言，使得它拥有了无限的可能性。但其使用方式已然落后，经过本次改造，将大大方便它与目前强大前端生态的无缝对接。

我们不应再将 RPG Maker MV 视为一个简单的游戏制作工具，而是把它当成一套成熟的基于 PixiJS 的游戏框架，配合一个强大的低代码编辑器，方便不同工种间的协作。我们可以在原有框架的基础上进行优化迭代，并更为轻松地为自己的游戏进行定制。

## 使用方式

1. clone 本项目到本地。项目中的 `/project` 目录即 RMMV 的工程目录。本仓库并不包含资源文件，请将对应的文件拷贝到 `/audio` 和 `/img` 文件夹下。
2. `npm install` 安装依赖。
3. 你可以按正常前端项目的方式启动。执行 `npm start`，游戏将在浏览器中运行。
4. 你也可以执行 `npm build` 生成对应的文件后，在 RPG Maker MV 中运行。

## 改动说明
- 所有的类和全局变量不再被挂载到 `window` 对象上。类请使用 ES6 `import` 引用。以 `$` 开头的全局变量使用 `import {global} from './DataManager'` 引用。
- 类均改写为了 `class` 语法。原有的 `initialize` 方法均使用构造函数实现。特例是 `Window_XXX` 相关类，由于执行顺序的原因，无法无感知地改写。因此这些类在 `new` 之后需手动调用 `initialize` 方法进行初始化。
- 代码原生使用 TypeScript 实现。但目前只是无脑改写，还存在大量的 `any` 和 `@ts-ignore`，会在后续进行完善。
- 由于目前只是无脑改写，并没有对所有功能进行测试。如遇运行时报错等情况欢迎 issue 。

## 未来计划
- 完善项目中各方法和第三方库的 TypeScript 定义
- 进一步对代码进行优化
- 对 PixiJS 底层进行升级

---

Refactor RPG Maker MV default scripts using modern frontend tools such as Webpack and TypeScript to make them easier to understand and further development.

RPG Maker MV uses JavaScript as its scripting language, which makes its possibilities endless. However, its usage is outdated and this refactoring will greatly facilitate its seamless integration with the current powerful front-end ecosystem.

We should no longer think of RPG Maker MV as a simple game creation tool, but as a full-fledged PixiJS-based game framework with a powerful low-code editor that facilitates collaboration between different types of work. We can optimize and iterate on the original framework and customize it for our own games more easily.

## Usage

1. Clone this project. The `/project` directory is the project directory of RMMV. This repository does not contain resource files, so please copy the corresponding files to the `/audio` and `/img` folders.
2. `npm install` the dependencies.
3. Run `npm start` and the game will run in the browser. 
4. You can also run `npm build` to generate the corresponding file and then run it in RPG Maker MV.

## Changes
- All classes and global variables are no longer mounted to the `window` object. Classes should be referenced using ES6 `import`. Global variables starting with `$` are referenced with `import {global} from './DataManager'`.
- Classes are rewritten to `class` syntax. The original `initialize` methods are implemented using constructors. A special case is the `Window_XXX` related classes, which cannot be rewritten imperceptibly due to the execution order. So these classes need to be initialized manually by calling the `initialize` method after `new`.
- The code is implemented natively using TypeScript. However, it is currently only rewritten mindlessly, and there are still a lot of `any` and `@ts-ignore`, which will be improved in the future.
- Since it is just a simple rewrite, we have not tested all the features. If you get any error, feel free to issue.

## Future plans
- Improve the definition of TypeScript for each method and third-party library in the project
- Optimize the code further
- Upgrade PixiJS version
