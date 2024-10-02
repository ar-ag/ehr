pragma solidity ^0.8.0;
import "./AccessControl.sol";
contract Storage {
    string private text;
    AccessControl public acc;

    bytes32 private constant PATIENT = keccak256(abi.encodePacked("PATIENT"));
    // 0xe5786ee6f50ab1a5567cb3f3f6840a2f4ddbafdf4a35cb2c52d5b732b1e84a32

    bytes32 private constant DOCTOR = keccak256(abi.encodePacked("DOCTOR"));
    // 0xc9c8e67a61d2e7371df46522b44051b955c16bf4b713ef44e1373b25bfcd80b2

    bytes32 private constant VIEWER = keccak256(abi.encodePacked("VIEWER"));
    // 0xdfb118e7fb180cb21baebdc5d0b33ccc34c8e0be422c1a4f57131ff74b98ca6e

    constructor(address _contract) {
        acc = AccessControl(_contract);
    }

    function set(string calldata _text) external {
        require(acc.roles(PATIENT, msg.sender) || acc.roles(DOCTOR, msg.sender), "not authorized");
        text = _text;
    }

    function get() external view returns(string memory) {
        require(acc.roles(PATIENT, msg.sender) || acc.roles(DOCTOR, msg.sender) || acc.roles(VIEWER, msg.sender), "not authorized");
        return text;
    }
}