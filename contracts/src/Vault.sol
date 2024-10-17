// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./Stabil.sol";

contract Vault {
    address collateralAddress;
    address stabilAddress;
    address ownerAddress;

    mapping(address => uint256) public collateralAmounts;
    mapping(address => uint256) public debtAmounts;
    uint256 public collateralPrice;
    uint256 public collateralRatio;
    uint256 public liquidationRatio;

    event SetCollateralPrice(uint256 collateralPrice);
    event DepositCollateral(address receiverAddress, uint256 amount);
    event WithdrawCollateral(address receiverAddress, uint256 amount);
    event MintStabil(address receiverAddress, uint256 amount);
    event BurnStabil(address receiverAddress, uint256 amount);

    constructor(address _stabilAddress, address _collateralAddress, uint256 _collateralRatio, uint256 _liquidationRatio, uint256 _collateralPrice) {
        stabilAddress = _stabilAddress;
        collateralAddress = _collateralAddress;
        ownerAddress = msg.sender;
        collateralRatio = _collateralRatio;
        liquidationRatio = _liquidationRatio;
        collateralPrice = _collateralPrice;
    }

    function setCollateralPrice(uint256 _collateralPrice) public {
        require(msg.sender == ownerAddress, "Only owner can invoke this method");

        collateralPrice = _collateralPrice;

        emit SetCollateralPrice(collateralPrice);
    }

    function depositCollateral(address receiverAddress, uint256 amount) public {
        require(ERC20(collateralAddress).balanceOf(msg.sender) > amount, "Amount exceeds your balance"); 

        bool result = ERC20(collateralAddress).transferFrom(msg.sender, address(this), amount);

        require(result, "Transfer doesn't successfully executed");

        collateralAmounts[receiverAddress] += amount;

        emit DepositCollateral(receiverAddress, amount);
    }

    function withdrawCollateral(address receiverAddress, uint256 amount) public {
        require(collateralAmounts[msg.sender] > amount, "Withdraw amount exceeds your collateral amount"); 

        uint256 newCollateralValue = (collateralAmounts[msg.sender] - amount) * collateralPrice;
        uint256 currentLiquidationValue = debtAmounts[msg.sender];

        require(newCollateralValue * liquidationRatio / 100 > currentLiquidationValue, "Withdrawal amount will makes your asset liquidated");

        bool result = ERC20(collateralAddress).transfer(receiverAddress, amount);

        require(result, "Transfer doesn't successfully executed");

        collateralAmounts[msg.sender] -= amount;

        emit WithdrawCollateral(receiverAddress, amount);
    }

    function mintStabil(address receiverAddress, uint256 amount) public {
        uint256 newDebtAmount = debtAmounts[msg.sender] + amount;
        uint256 currentCollateralValue = collateralAmounts[msg.sender] * collateralPrice;

        require(newDebtAmount * liquidationRatio / 100 < currentCollateralValue, "The amount of request tokens exceeds the collateral");

        IStabil(stabilAddress).mint(receiverAddress, amount);

        debtAmounts[msg.sender] = newDebtAmount;

        emit MintStabil(receiverAddress, amount);
    }

    function burnStabil(address receiverAddress, uint256 amount) public {
        require(ERC20(stabilAddress).balanceOf(msg.sender) > amount, "The burnt amount exceeds your balance");

        IStabil(stabilAddress).burn(amount);

        debtAmounts[msg.sender] -= amount;

        emit BurnStabil(receiverAddress, amount);
    }
}
