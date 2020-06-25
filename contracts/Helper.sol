pragma solidity >=0.5.0;

//do-nothing contract. just that we can have GSN artifacts in this project
// (without "polluting" the MetaCoin itself)
import "@opengsn/gsn/contracts/RelayHub.sol"; // import needed for artifact generation
import "@opengsn/gsn/contracts/TrustedForwarder.sol"; // import needed for artifact generation
import "@opengsn/captcha-paymaster/contracts/CaptchaPaymaster.sol"; // import needed for artifact generation

contract Helper {
}
