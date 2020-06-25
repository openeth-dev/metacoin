const MetaCoin = artifacts.require('MetaCoin.sol')
const TrustedForwarder = artifacts.require('TrustedForwarder.sol')
const CaptchaPaymaster = artifacts.require('CaptchaPaymaster.sol')

module.exports = async function deployFunc (deployer, network) {
  const netid = await web3.eth.net.getId()

  // first, check if already deployed through truffle:
  let forwarder = await TrustedForwarder.deployed().then(c => c.address).catch(e => null)
  if (!forwarder) {
    if (netid > 100) {
      forwarder = (await deployer.deploy(TrustedForwarder)).address
    } else {
      // don't automatically install on other networks. should have entires here.
      const forwarders = {
        42: '0x6453D37248Ab2C16eBd1A8f782a2CBC65860E60B',
        3: '0xcC87aa60a6457D9606995C4E7E9c38A2b627Da88'
      }
      forwarder = forwarders[netid]
    }
    if (!forwarder) {
      throw new Error('no valid forwarder for network ', network)
    }
  }
  console.log('using forwarder: ', forwarder)
  await deployer.deploy(MetaCoin, forwarder)

  from = (await web3.eth.getAccounts())[0]
  await deployer.deploy(CaptchaPaymaster, 
    '19e7e376e7c213b7e7e7e46cc70a5dd086daff2a', //signer
    'https://gsn-captcha-paymaster.netlify.app/.netlify/functions/validate-captcha',
    "captcha:"  //signed data prefix
    )
  const pm = await CaptchaPaymaster.deployed()
  await pm.setRelayHub(require('../build/gsn/RelayHub').address, {from})
  await web3.eth.sendTransaction({from,to:CaptchaPaymaster.address, value:5e17})

  console.log('Finished 2/3 migrations files')
}
