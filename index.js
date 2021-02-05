const SDK = require('hyper-sdk')
const Hyperbee = require('hyperbee')
const HyperbeeDown = require('hyperbeedown')

module.exports = function makeNetworkedHypercore (opts = {}) {
  let { Hypercore, close } = opts

  async function _init () {
    if (!Hypercore) {
      const sdk = await SDK(opts)
      Hypercore = sdk.Hypercore
      close = sdk.close
    }
  }

  // TODO: DNS support
  return class NetworkedHyperbeedown extends HyperbeeDown {
    static close () {
      if (!close) return Promise.resolve()
      return close()
    }

    constructor (url, opts = {}) {
      super(opts)
      this.__opts = opts
      this._url = url
    }

    async _networkOpen () {
      await _init()
      const core = Hypercore(this._url, this.__opts)
      const tree = new Hyperbee(core, this.__opts)
      this.core = core
      this.tree = tree
      await this.tree.ready()
    }

    async _open (_, cb) {
      if (this._isLoading) {
        try {
          await this._isLoading
          this._isLoading = null
          cb()
        } catch (e) {
          cb(e)
        }
      } else {
        this._isLoading = this._networkOpen()
        this._open(_, cb)
      }
    }

    async getURL () {
      await this.tree.ready()
      return `hyper://${this.core.key.toString('hex')}/`
    }
  }
}
