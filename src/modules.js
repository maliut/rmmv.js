const moduleMap = {}

const modules = [
  require.context('./core', true, /\.ts$/),
  require.context('./managers', true, /\.ts$/),
  require.context('./objects', true, /\.ts$/),
  require.context('./scenes', true, /\.ts$/),
  require.context('./sprites', true, /\.ts$/),
  require.context('./windows', true, /\.ts$/)
]

modules.forEach(getter => {
  getter.keys().forEach(key => {
    const [, name] = key.match(/^\.\/(.+)\.ts$/)
    moduleMap[name] = getter(key)[name]
  })
})

export { moduleMap }
