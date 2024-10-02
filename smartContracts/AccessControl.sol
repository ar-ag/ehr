pragma solidity ^0.8.0;

contract AccessControl {

    event GrantRole(bytes32 indexed role, address indexed account);
    event RevokeRole(bytes32 indexed role, address indexed account);

    mapping(bytes32 => mapping(address => bool)) public roles;

    bytes32 private constant PATIENT = keccak256(abi.encodePacked("PATIENT"));
    // 0xe5786ee6f50ab1a5567cb3f3f6840a2f4ddbafdf4a35cb2c52d5b732b1e84a32

    bytes32 private constant DOCTOR = keccak256(abi.encodePacked("DOCTOR"));
    // 0xc9c8e67a61d2e7371df46522b44051b955c16bf4b713ef44e1373b25bfcd80b2

    bytes32 private constant VIEWER = keccak256(abi.encodePacked("VIEWER"));
    // 0xdfb118e7fb180cb21baebdc5d0b33ccc34c8e0be422c1a4f57131ff74b98ca6e

    modifier onlyRole(bytes32 _role) {
        require(roles[_role][msg.sender], "not authorized");
        _;
    }
    
    constructor() {
        _grantRole(PATIENT, msg.sender);
    }

    function _grantRole(bytes32 _role, address _account) internal {
        roles[_role][_account] = true;
        emit GrantRole(_role, _account);
    }

    function grantRole(bytes32 _role, address _account) external onlyRole(PATIENT){
        _grantRole(_role, _account);
    }

    function revokeRole(bytes32 _role, address _account) external onlyRole(PATIENT){
        roles[_role][_account] = false;
        emit RevokeRole(_role, _account);

    }


}