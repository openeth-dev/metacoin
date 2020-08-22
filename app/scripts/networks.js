module.exports = {
  networks: {
    42: {
      addressUrl: 'https://dashboard.tenderly.co/contract/kovan/',
      txUrl: 'https://dashboard.tenderly.co/tx/kovan/',
      // addressUrl: 'https://kovan.etherscan.io/address/',
      // txUrl: 'https://kovan.etherscan.io/tx/',
      metacoin: '0x90c2344d737923048f37d6818fe5BC925071aFf9',
      relayHub: '0xcfcb6017e8ac4a063504b9d31b4AbD618565a276',
      paymaster: '0x9940c8e12Ca14Fe4f82646D6d00030f4fC3C7ad1',
      forwarder: '0x663946D7Ea17FEd07BF1420559F9FB73d85B5B03'
    },
    3: {
      addressUrl: 'https://dashboard.tenderly.co/contract/ropsten/',
      txUrl: 'https://dashboard.tenderly.co/tx/ropsten/',
      // addressUrl: 'https://ropsten.etherscan.io/address/',
      // txUrl: 'https://ropsten.etherscan.io/tx/',
      metacoin: '0x1a1FE778E4026aB3677b402E232Ac7C35E318f05',
      relayHub: '0xF0851c3333a9Ba0D61472de4C0548F1160F95f17',
      paymaster: '0x4aa21CdEba9dfEC2C2621b83a15262a41C67aC67',
      forwarder: '0x766400B526fB5889AE6C52b369671F5eE137880b'
    }
  }
}
