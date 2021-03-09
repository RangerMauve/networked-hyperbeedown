# networked-hyperbeedown
LevelDB-compatible module for loading p2p databases using hyperbee and hyperswarm

## Usage

```shell
npm i --save networked-hyperbeedown levelup
```

```
const levelup = require('levelup')
const { once } = require('events')

const NetworkedHyperbeedown = require('networked-hyperbeedown')()

const down = new NetworkedHyperbeedown('hyper://someurlhere', {
  keyEncoding: 'utf-8'
})

const db = levelup(down)

await db.open()

// Wait for an initial peer before tryinng to load data
await once(down.core, 'peer-open')

const value = await db.get('Example')

console.log('Got value from remote:', value)
```

## API

### `const NetworkedHyperbeedown = makeNetworkedHyperbeedown({Hypercore, close, ...opts})`

Creates an instance of NetworkedHyperbeeDown.

Provide a custom `Hypercore` constructor and optional `close` for cleaning up if you want full control.

Else you can pass in `opts` which will initialize [hyper-sdk](https://github.com/datproject/sdk/#const-hypercore-hyperdrive-resolvename-keypair-derivesecret-registerextension-close--await-sdkopts)

This will return a constructor for `NetworkedHyperbeedown`.

### `const hyperbeedown = new NetworkedHyperbeedown(url)`

Once you have a `NetworkedHyperbeedown` reference, you can initialize storage with urls.

The `hyperbeedown` instance returned can be passed to `levelup` or anything else that uses `abstract-leveldown`.

The `url` should be a `hyper://` URL which will be passed to the `Hypercore` constructor.

You can pass in an actual public key in the URL if you want to load from the network (which will make it readonly) like `hyper://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`.

You can also pass a custom `name` for the URL which will derive a key for you like `hyper://example`

### `const url = await hyperbeedown.getURL()`

If you used a custom `name` for your hyperbee, you can resolve it to the actual publicly accessible URL through this.

Make sure your db has been opened before calling this.

The `url` is a string.

### `const core = hyperbeedown.core`

You can get a reference to the `hypercore` with this property
