// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IStabil {
    function setVault(address _vaultAddress) external;
    function mint(address receiverAddress, uint256 amount) external;
    function burn(uint256 amount) external;
}

contract Stabil is IStabil, ERC20 {
    address public ownerAddress;
    address public vaultAddress;

    constructor() ERC20("Stabil", "STB") {
        ownerAddress = vaultAddress;
    }

    function setVault(address _vaultAddress) public {
        require(ownerAddress == msg.sender, "Only owner is allowed to invoke this method");
        require(vaultAddress == address(0), "Vault has been set");

        vaultAddress = _vaultAddress;
    }

    function mint(address receiverAddress, uint256 amount) external {
        require(msg.sender == vaultAddress, "Only vault can invoke this method");
        
        _mint(receiverAddress, amount);
    }

    function burn(uint256 amount) external {
        require(msg.sender == vaultAddress, "Only vault can invoke this method");
        
        _burn(msg.sender, amount);
    }
}
