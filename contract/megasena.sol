pragma solidity ^0.8.0;

contract MegaSena{

    address owner;

    address winner;

    uint[] numbers;

    uint[] raffledNumbers;

    struct Player {
        address id;
        uint[] _numbers;
    }

    Player [] players;

    uint prize;

    mapping (address => Player) private PlayerMap;

    constructor() public {
        owner = msg.sender;
        
        for(uint i = 1; i <= 60; i++){
            numbers.push(i);
        }

        for(uint i = 0; i < 6; i++){
            raffledNumbers.push(0);
        }

        for (uint256 i = 0; i < numbers.length; i++) {
            uint256 n = i + uint256(keccak256(abi.encodePacked(block.timestamp))) % (numbers.length - i);
            uint256 temp = numbers[n];
            numbers[n] = numbers[i];
            numbers[i] = temp;
        }

        prize = 0;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the contract owner can invoke this function!");
        _;
    }

    function bet(uint[] memory numbers) external payable {
        require(msg.value == 10000 wei, "Player must pay the tax to participate");
        require(numbers.length == 6, "Player can bet in only 6 numbers");
        PlayerMap[msg.sender].id = msg.sender;
        PlayerMap[msg.sender]._numbers = numbers;
        players.push(PlayerMap[msg.sender]);
        prize += msg.value;
    }

    function getPlayerNumbers(address id) public view returns (uint[] memory) {
        return PlayerMap[id]._numbers;
    }

    function getPrize() public view returns (uint){
        return prize/10 * 9;
    }

    function raffle() external payable {
        
        for (uint256 i = 0; i < numbers.length; i++) {
            uint256 n = i + uint256(keccak256(abi.encodePacked(block.timestamp))) % (numbers.length - i);
            uint256 temp = numbers[n];
            numbers[n] = numbers[i];
            numbers[i] = temp;
        }

        for(uint i = 0; i < 6; i++){
            raffledNumbers[i] = numbers[i];
        }
    }

    function getRaffledNumbers() public view returns (uint[] memory) {
        return raffledNumbers;
    }

    function claimPrize() external payable {
        uint count = 0;
        for(uint i = 0; i < raffledNumbers.length; i++){
            for(uint k = 0; k < PlayerMap[msg.sender]._numbers.length; k++){
                if(raffledNumbers[i] == PlayerMap[msg.sender]._numbers[k]){
                    count += 1;
                }
            }
        }
        require(count >= 6, "You are not the winner! You cannot claim the prize!");
        address payable payment = payable(msg.sender);
        payment.transfer(getPrize());
        prize = 0;
    }

}