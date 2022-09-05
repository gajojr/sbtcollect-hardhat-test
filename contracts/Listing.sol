// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Listing {
    address public owner;
    address public developer = 0x1c79EdcaC6F24D7C3069339FFD09dA5DaF4E487f;
    uint public listingPrice = 2 ether;
    mapping(address => bool) public payers;

    constructor() {
        owner = msg.sender;
    }

    function payForListing() public payable {
        if(msg.sender != owner && msg.sender != developer) {
            require(msg.value >= 2 ether, "You haven't paid enough!");
        }

		payers[msg.sender] = true;
    }

    function changeListingPrice(uint _newPrice) public {
        require(msg.sender == owner, "Only owner can change the price!");
        listingPrice = _newPrice;
    }

    function withdraw() public {
        require(msg.sender == owner || msg.sender == developer, "Only owner and developer can withdraw funds!");

        (bool developerReceived, ) = payable(developer).call{value: address(this).balance * 4 / 10}("");
        require(developerReceived);
        (bool ownerReceived, ) = payable(owner).call{value: address(this).balance}("");
        require(ownerReceived);
    }
}