// Allows us to use ES6 in our migrations and tests.
require('babel-register')
var HDWalletProvider = require('truffle-hdwallet-provider')
var mnemonic = 'give cancel discover junk point despair woman piece cart typical void bench hub tenant winter'
function readFile(name) {

  const fs = require('fs')
  // if (fs.existsSync(secretMnemonicFile)) {
    return fs.readFileSync('.secret-mnemonic.txt', { encoding: 'utf8' })
  // }
}
module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/c3422181d0594697a38defe7706a1e5b')
      },
      network_id: 4
    },
  },
  compilers: {
    solc: {
      version: '0.5.10'
    }
  }
}
