// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
contract Stake {
     address owner = msg.sender;
    // mapping(uint256 => bool) usedNonces;

    // owners for nonce
    mapping(uint256 => address) owners;

    constructor() payable {}

    /** stake _amount to the contract */
    function stake(uint256 _amount, uint256 _nonce) payable public {
        require(msg.value == _amount);
        owners[_nonce] = msg.sender;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getNonceOwner(uint256 _nonce) public view returns (address) {
        return owners[_nonce];
    }

    function claimPayment(uint256 amount, uint256 nonce, bytes memory signature) external {
        // require(!usedNonces[nonce]);
        // usedNonces[nonce] = true;

        // this recreates the message that was signed on the client
        bytes32 message = prefixed(keccak256(abi.encodePacked(msg.sender, amount, nonce, this)));

        require(recoverSigner(message, signature) == owners[nonce]);

        // prevent repeat attack
        owners[nonce] = address(0);

        payable(msg.sender).transfer(amount);
    }

    /// destroy the contract and reclaim the leftover funds.
    function shutdown() external {
        require(msg.sender == owner);
        selfdestruct(payable(msg.sender));
    }

    /// signature methods.
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
        internal
        pure
        returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    /// builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}