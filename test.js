const test = require('tape')
const levelup = require('levelup')
const { once } = require('events')

const makeNetworkedHypercore = require('./')

const EXAMPLE_DATA = Buffer.from('hello world')

test('Add to DB and load remotely', async (t) => {
  const N1 = makeNetworkedHypercore({ persist: false })
  const N2 = makeNetworkedHypercore({ persist: false })

  try {
    const down1 = new N1('hyper://example')
    const db1 = levelup(down1)

    await db1.open()

    t.pass('able to open the db')

    const url = await down1.getURL()

    t.ok(url, 'generated a URL')

    await db1.put(EXAMPLE_DATA, EXAMPLE_DATA)

    const down2 = new N2(url)
    const db2 = levelup(down2)

    await db2.open()

    await once(down2.core, 'peer-open')

    const url2 = await down2.getURL()

    t.equal(url2, url, 'Second instance loaded same URL')

    const result = await db2.get(EXAMPLE_DATA)

    t.deepEqual(result, EXAMPLE_DATA, 'Loaded value from remote db')
  } catch (e) {
    t.fail(e)
  } finally {
    await Promise.all([
      N1.close(),
      N2.close()
    ])
  }
})
