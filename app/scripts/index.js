/* global ethereum grecaptcha */
// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import Web3 from 'web3'
import contract from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metaCoinArtifact from '../../build/contracts/MetaCoin.json'
import IPaymaster from '../../build/contracts/IPaymaster'
import { networks } from './networks'

import {createCaptchaAsyncApprovalCallback } from '@opengsn/captcha-paymaster'
import {gsnValidate} from './validate'
const Gsn = require('@opengsn/gsn/dist/src/relayclient/')
const configureGSN = require('@opengsn/gsn/dist/src/relayclient/GSNConfigurator').configureGSN


const RelayProvider = Gsn.RelayProvider

let lastValidApproval

// MetaCoin is our usable abstraction, which we'll use through the code below.
const MetaCoin = contract(metaCoinArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account
let forwarder
let paymaster
let gsnConfig
var network

const App = {
  start: async function () {

    const self = this
    // This should actually be web3.eth.getChainId but MM compares networkId to chainId apparently
    web3.eth.net.getId(function (err, networkId) {
      if (parseInt(networkId) < 1e4) { // We're on testnet/
        console.log( 'using network ', networkId)
        network = networks[networkId]
        MetaCoin.networks[networkId] = { address: network.metacoin }
        // MetaCoin.deployed = () => MetaCoin.at(network.metacoin).catch( err=> {
        //   console.log( 'no metacoin: ', err)
        // })
      } else { // We're on ganache

        //instead of loading contract and using "...deployed()"
        const captchaPaymaster = require( '../../build/contracts/CaptchaPaymaster').networks[networkId].address

        //needed only  to have an address
        CaptchaPaymaster.setProvider(web3.currentProvider)
        console.log('Using local ganache')
        network = {
          relayHub: require('../../build/gsn/RelayHub.json').address,
          stakeManager: require('../../build/gsn/StakeManager.json').address,
          paymaster: captchaPaymaster
        }
      }
      if (!network) {
        const fatalmessage = document.getElementById('fatalmessage')
        fatalmessage.innerHTML = "Wrong network. please switch to 'kovan' or 'ropsten'"
        return
      }
      console.log( 'chainid=', networkId, network)

      if (err) {
        console.log('Error getting chainId', err)
        process.exit(-1)
      }
      gsnConfig = configureGSN({
        // verbose:true,
        relayHubAddress: network.relayHub,
        stakeManagerAddress: network.stakeManager,
        methodSuffix: '_v4',
        jsonStringifyRequest: true,
        chainId: networkId,
        paymasterAddress: network.paymaster,
        relayLookupWindowBlocks: 1e5
      })

      // This is the only require asyncApprovalData.
      // the code below is for disabling local tests, so we can see real on-chain validation
      let asyncApprovalData = createCaptchaAsyncApprovalCallback(web3, () => grecaptcha.getResponse())

      // FOR TESTING: wrap it, so we can test "old" captcha checking:
      const allowOldCaptcha_asyncApprovalData = createCaptchaAsyncApprovalCallback(web3, async () => {
        let ret
        try {
          ret = await grecaptcha.getResponse()
        } catch (e) {
          console.log('grecaptcha ex=', e.toString(), 'using lastValid:', lastValidApproval)
          return lastValidApproval || '0x'
        }
        // for testing: if no captcha data, use old (stale) result
        if (ret) {
          lastValidApproval = ret
        } else {
          console.log( 'no valid approval. re-using old approval (which should fail...)')
          ret = lastValidApproval || '0x'
        }

        // if you further want to verify the signature check, modify one of the last 65 bytes.
        return ret || '0x'
      })

      // Replace the asyncApprovalData with a "relaxed" wrapper that always send something to the paymaster
      asyncApprovalData = async (req) => {
        try {
          return await allowOldCaptcha_asyncApprovalData(req)
        } catch (e) {
          console.log('asyncApprovalData ex=', e)
          // instead of aborting, send "something" as approval data
          return '0x'
        }
      }


      var provider = new RelayProvider(web3.currentProvider, gsnConfig, {
        asyncApprovalData
      })

      web3.setProvider(provider)

      // Bootstrap the MetaCoin abstraction for Use.
      MetaCoin.setProvider(web3.currentProvider)

      // Get the initial account balance so it can be displayed.
      web3.eth.getAccounts(function (err, accs) {
        if (err != null) {
          alert('There was an error fetching your accounts.')
          return
        }

        if (accs.length === 0) {
          alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
          return
        }

        accounts = accs
        account = accounts[0]

        self.refreshBalance()
      })
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  link: function (path, text) {
    return '<a href="' + network.baseurl + path + '">' + text + '</a>'
  },

  addressLink: function (addr) {
    return '<a href="' + network.addressUrl + addr + '" target="_info">' + addr + '</a>'
  },

  txLink: function (addr) {
    return '<a href="' + network.txUrl + addr + '" target="_info">' + addr + '</a>'
  },

  refreshBalance: function () {
    const self = this

    function putItem(name,val) {
      const item = document.getElementById(name)
      item.innerHTML = val
    }
    function putAddr(name,addr) {
      putItem(name, self.addressLink(addr))
    }

    putAddr( 'paymaster', network.paymaster )
    putAddr( 'hubaddr', network.relayHub )

    const pm = new web3.eth.Contract( IPaymaster.abi, network.paymaster ).methods
    pm.getRelayHubDeposit().call().then(bal=> {
      putItem( 'paymasterBal', "- eth balance: "+(bal/1e18) )
    }).catch(()=>putItem( 'paymasterBal', "invalid paymaster"))


    let meta
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      // console.log('Metacoin deployed', instance)
      const address = document.getElementById('address')
      address.innerHTML = self.addressLink(account)
      putAddr( 'metaaddr', MetaCoin.address)

      gsnValidate({
        web3,
        ...gsnConfig,
        to: MetaCoin.address,
        from: account
      }).catch(err=>{
        console.log( 'fatal: error', err)
      }).then( ()=>console.log( 'gsn config Validated OK'))


      return meta.balanceOf.call(account, { from: account })
    }).then(function (value) {
      const balanceElement = document.getElementById('balance')
      balanceElement.innerHTML = value.valueOf()

      return meta.getTrustedForwarder.call({ from: account })
    }).then(function (forwarderAddress) {

      const forwarderElement = document.getElementById('forwarderAddress')
      forwarderElement.innerHTML = self.addressLink(forwarderAddress, forwarderAddress)

    }).catch(function (e) {
      const fatalmessage = document.getElementById('fatalmessage')
      console.log(e)
      if ( /mismatch/.test(e)) {
        fatalmessage.innerHTML = "Wrong network. please switch to 'kovan'"
      }
      self.setStatus('Error getting balance; see log.')
    })
  },

  mint : function () {
    const self = this
    MetaCoin.deployed().then(function (instance) {
      console.log('Metacoin deployed', instance)
      self.setStatus('Mint: Initiating transaction... (please wait)')
      return instance.mint({ from: account })
    }).then(function (res) {
      self.refreshBalance()
      self.setStatus('Mint transaction complete!<br>\n' + self.txLink(res.tx))
    }).catch(function (err) {
      console.log('mint error:', err)
      self.setStatus('Error getting balance; see log.')
    })
  },

  transfer: function () {
    const self = this

    const amount = parseInt(document.getElementById('amount').value)
    const receiver = document.getElementById('receiver').value

    this.setStatus('Initiating transaction... (please wait)')

    let meta
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      //console.log('Metacoin deployed', instance)
      return meta.transfer(receiver, amount,
        { from: account })
    }).then(function (res) {
      self.setStatus('Transaction complete!<br>\n' + self.txLink(res.tx))
      self.refreshBalance()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  }
}

window.App = App
window.addEventListener('load', async () => {
  // Modern dapp browsers...
  if (window.ethereum) {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' (and allowed the app to access MetaMask.)' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    window.web3 = new Web3(ethereum)
    try {
      // Request account access if needed
      await ethereum.enable()
    } catch (error) {
      // User denied account access...
      alert('NO NO NO')
    }
  } else if (window.web3) {
    // Legacy dapp browsers...
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  }
  await App.start()
})
