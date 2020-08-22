// SPDX-License-Identifier: MIT
pragma solidity ^0.6.9;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/MetaCoin.sol";

contract TestMetacoin {

  function testInitialBalanceUsingDeployedContract() public {
    MetaCoin meta = MetaCoin(DeployedAddresses.MetaCoin());

    uint expected = 10000;

    Assert.equal(meta.balanceOf(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  }

  function testInitialBalanceWithNewMetaCoin() public {

    MetaCoin meta = new MetaCoin(address(0));

    uint expected = 10000;

    Assert.equal(meta.balanceOf(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  }

}
