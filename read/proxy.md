```javascript
  const obj = {
    _private: '123',
    publice: 666
  }
  let proxyObj = new Proxy(obj, {
    get(target, prop, receiver) {
      if (prop[0] === '_') {
        throw new Error(`${prop} is private attribute`)
      }
      return target[prop]
    },
    set(target, prop, value) {

    }
  })
  console.log(proxyObj._my)

  const defaultOptions = {
    trackFunctions: true,
    trackProps: true,
    trackTime: true,
    trackCaller: true,
    trackCount: true,
    stdout: null,
    filter: null
  }
  function proxyTrack(entity, options = defaultOptions) {
    if (typeof entity === 'function') return trackClass(entity, options)
    return trackObject(entity, options)
  }

  function trackObject(obj, options = {}) {
    const { trackFunctions, trackProps } = options
    let result = obj
    if (trackFunctions) proxyFunctions(result, options)
    if (trackProps) {
      result = new Proxy(obj, {
        set: trackPropertySet(options),
        get: trackPropertyGet(options)
      })
    }
    return result
  }

  function trackPropertySet(options = {}) {
    return function set(target, prop, value, receiver) {
      const { trackCaller, trackCount, stdout, filter } = options
      const error = trackCaller && new Error()
      const caller = getCaller(error)
      const contextName = target.constructor.name === 'Object' ? '' : `${target.constructor.name}.`
      const name = `${contextName}${prop}`
      const hashKey = `set_${name}`
      if (trackCount) {
        if (!callerMap[hashKey]) {
          callerMap[hashKey] = 1
        } else {
          callerMap[hashKey]++;
        }
      }
      let output = `${name} is being set`
      if (trackCaller) {
        output += ` by ${caller.name}`
      }
      if (trackCount) {
        output += `for the ${callerMap[hashKey]} time`
      }
      let canReport = true;
      if (filter) {
        canReport = filter({
          type: 'get',
          prop,
          name,
          caller,
          count: callerMap[hashKey],
          value,
        });
      }
      if (canReport) {
        if (stdout) {
          stdout(output);
        } else {
          console.log(output);
        }
      }
      return Reflect.set(target, prop, value, receiver);
    };
  }

  const validate = (obj, valis) => {
    return new Proxy(obj, {
      set(target, key, value) {
        const _vali = valis[key]
        if (!_vali) {
          target[key] = value
        } else if (_vali.validate(value)) {
          target[key] = value
        } else {
          console.log(_vali.msg || '')
        }
      }
    })
  }

  const pipe = (value, obj) => {
    const stack = []
    const _proxy = new Proxy(obj, {
      get(target, prop) {
        if (prop === 'execute') {
          return stack.reduce(function (val, fn) {
            return fn(val)
          }, value)
        }
        stack.push(target[prop])
        return _proxy
      }
    })
    return _proxy
  }

  const math = {
    double: n => n * 2,
    pow: n => n * n
  }

  let res = pipe(4, math).double.pow.execute
  console.log(res)
```