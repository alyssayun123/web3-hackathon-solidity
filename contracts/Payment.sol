// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
contract Payment {
    // mapping(uint256 => bool) usedNonces;
    // address payable public owner;

    mapping(address => uint256) public canClaim;

    constructor() {
        // owner = payable(msg.sender);
    }

    function stake(uint256 _amount, address payable _to) payable public {
        require(msg.value == _amount);
        canClaim[_to] += _amount;
    }
    
    function withdraw(uint256 _amount, address payable _to) external payable {
        require(
            canClaim[_to] >= _amount,
            "insufficient balance to claim"
        );
        require(_amount >= 0, "negative value");

        _to.transfer(_amount);
        canClaim[msg.sender] -= _amount;
    }

    function getClaimable(address recipient) public view returns (uint256) {
        return canClaim[recipient];
    }
}