import IPaymaster from '../../build/contracts/IPaymaster'
import IRelayRecipient from '../../build/contracts/IRelayRecipient'
import IRelayHub from '../../build/contracts/IRelayHub'

const zeroAddr = '0x'+'0'.repeat(40)
function assert(e, msg) {
    if ( !e)
        throw new Error("Validation failed: "+msg)
}
function assertEquals(actual, expected, msg) {
    if ( actual!= expected)
        throw new Error(`Not equal: ${actual} != ${expected}: ${msg}`)
}
async function gsnValidate({
    web3,
    from,
    to,
    paymasterAddress,
    relayHubAddress,
    stakeManagerAddress
}) {
    assert(web3, "no web3 param")
    assert(to, "no to param")
    assert(from, "no from param")
    assert(paymasterAddress, "no paymasterAddress param")
    assert(relayHubAddress, "no relayHubAddress param")

    const r = new web3.eth.Contract(IRelayRecipient.abi, to ).methods
    const pm = new web3.eth.Contract(IPaymaster.abi, paymasterAddress).methods
    const hub = new web3.eth.Contract(IRelayHub.abi, relayHubAddress).methods

    await r.getTrustedForwarder().call().catch(()=>null)
    assert(r, "to is not RelayRecipient")
    assert(r != zeroAddr, "no TrustedForwarder set")

    const pmHub = await pm.getHubAddr().call().catch(()=>null)
    assert(pmHub, "pm not valid contract")
    assert(pmHub != zeroAddr, "pm.setRelayHub() not called")
    assertEquals(pmHub,relayHubAddress, "hub mismatch" )

    if ( stakeManagerAddress ) {
        assertEquals( stakeManagerAddress, await hub.getStakeManager().call(), "wrong stakeManagerAddress")
    }
    const bal = await hub.balanceOf(paymasterAddress).call()
    assert( bal > 1e9, "paymaster low balance: "+bal.toString())

}

module.exports={gsnValidate}