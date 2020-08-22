//SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

library ConvertLib{
    function convert(uint amount,uint conversionRate) internal pure returns (uint convertedAmount)
    {
        return amount * conversionRate;
    }
}
