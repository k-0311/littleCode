```javascript
class App {
    constructor(options) {
        this.options = options
    }
    static use(plugin) {
        const _modules = (this._modules || (this._modules = []))
        if (_modules.indexOf(plugin) > -1) {
            return this
        }
        const args = [...arguments]
        args.splice(0, 1, this)
        if (typeof plugin.install === 'function') {
            plugin.install.apply(plugin, args)
        } else if (typeof plugin === 'function') {
            plugin.apply(null, args)
        }
        _modules.push(plugin)
        return this
    }
}

class Plugin {
    constructor(options) {
		// some options...
    }
    install(app, ...args) {
        // do something...
    }
}
let plugin = new Plugin()

App.use(plugin, 1, 5, 4, 94, 974, 94, 9)
new App({ name: 'raven', outfit: 'ubi' })
```

