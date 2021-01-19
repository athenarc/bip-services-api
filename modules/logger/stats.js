const fs = require('fs')
const FILE_PATH = 'stats.json'

// read json object from file
const readStats = () => {
    let result = {}
    try {
        result = JSON.parse(fs.readFileSync(FILE_PATH))
    } catch (err) {
        console.error(err)
    }
    return result
}

// dump json object to file
const dumpStats = (stats) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(stats), { flag: 'w+' })
    } catch (err) {
        console.error(err)
    }
}

const update = (method) => {
    const stats = readStats()
    stats[method] = stats[method] ? stats[method] + 1 : 1
    dumpStats(stats)
}

module.exports = { update };
