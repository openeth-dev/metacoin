// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

//do-nothing contract. just that we can have GSN artifacts in this project
// (without "polluting" the MetaCoin itself)
import "@opengsn/gsn/contracts/RelayHub.sol"; // import needed for artifact generation
import "@opengsn/gsn/contracts/forwarder/Forwarder.sol"; // import needed for artifact generation

contract Helper {
}
