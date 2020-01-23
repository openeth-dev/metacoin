const ConvertLib = artifacts.require('./ConvertLib.sol')
const MetaCoin = artifacts.require('./MetaCoin.sol')

const networks = {
  ropsten: {
    relayHubAddr: '0x1349584869A1C7b8dc8AE0e93D8c15F5BB3B4B87'
  },
  development: {
    relayHubAddr: '0xd216153c06e857cd7f72665e0af1d7d82172f494'
  }
}

const RelayHub = artifacts.require('./RelayHub.sol')

module.exports = async function deployFunc(deployer, network) {
  let hubAddr = process.env.HUB
  if ( !hubAddr && networks[network] ) {
    hubAddr = networks[network].relayHubAddr
  }
  if ( !hubAddr ) {
    console.log( "must specify HUB=<addr>")
    process.exit(1)
  }
  console.log('hub=', hubAddr)
  const hub = await RelayHub.at(hubAddr)
  // await deployer.deploy(ConvertLib)
  // await deployer.link(ConvertLib, MetaCoin)

  await deployer.deploy(MetaCoin)
  try {
    await hub.depositFor(MetaCoin.address, { value: 1e17 })
    console.log('== Initializing Metacoin\'s Hub')
    const metacoin = await MetaCoin.at(MetaCoin.address)
    await metacoin.init_hub(hub.address)
    console.log('Finished 2/3 migrations files')
  }catch (e) {
      console.log( "Cought error configuring MetaCoin", e.message)
      //ignore error: it repeats and succeeds.
  }
}
