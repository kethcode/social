// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// ----------------------------------------------------------------------------
/// Overview
/// ----------------------------------------------------------------------------
///
/// The Social Contract is a relationship map between addresses. Keys are hashed
/// and used to index the mapping. Values are stored raw for retrieval.
///
/// Anticipated Common Use Cases:
/// set (self, self, 'profile:avatar', 'nftAddress,tokenId');
/// get (contract, contract, 'keyList');
///
/// set (contract, user, 'member', 'true');
/// set (user, contract, 'member' 'true');
/// isMutual (contract, user, 'member');
///
/// approve (contract, 'reputation', true);
/// canEdit (contract, user, 'reputation');
/// set(user, contract, 'reputation', '100');	// from contract
/// set(contract, user, 'reputation', '100');	// from contract

/// Function ToC:
//  set(address _sender, address _recipient, string memory _key, string memory _value)
//  get(address _sender, address _recipient, string memory _key) returns (string memory)
//  isMutual( address _sender, address _recipient, string memory _key) returns (bool)
//  approve(address _recipient, string memory _key, bool _value)
//  canEdit(address _sender, address _recipient, string memory _key) returns (bool)

/// ----------------------------------------------------------------------------
/// Library Imports
/// ----------------------------------------------------------------------------
import "hardhat/console.sol";

/// ----------------------------------------------------------------------------
/// Contract Imports
/// ----------------------------------------------------------------------------

/**
 * @title Social
 */
contract Social {
    /// ------------------------------------------------------------------------
    /// Events
    /// ------------------------------------------------------------------------
    event EdgeAdded(
        address indexed sender,
        address indexed recipient,
        string indexed key,
        string value
    );

    // gives remote contracts permission to edit senders keys
    // the ApproveAll key can be used for blanket permissions, perhaps
    event ApprovalChanged(
        address indexed sender,
        address indexed recipient,
        string indexed key,
        bool value
    );

    /// ------------------------------------------------------------------------
    /// Variables
    /// ------------------------------------------------------------------------
    address public owner;
    mapping(address => mapping(address => mapping(bytes32 => string))) graph;
    mapping(address => mapping(address => mapping(bytes32 => bool))) approved;

    /// ------------------------------------------------------------------------
    /// Constructor
    /// ------------------------------------------------------------------------
    constructor() {
        owner = msg.sender;
    }

    /// ------------------------------------------------------------------------
    /// Public Functions
    /// ------------------------------------------------------------------------
    function set(
        address _sender,
        address _recipient,
        string memory _key,
        string memory _value
    ) public {
        require(
            (_sender == msg.sender) ||
			(canEdit(_sender, _recipient, _key)) ||
			(canEdit(_sender, _recipient, "ApproveAll")),
            "Not Authorized to Edit"
        );
        graph[_sender][_recipient][Bytes32(_key)] = _value;
        emit EdgeAdded(_sender, _recipient, _key, _value);
    }

    function get(
        address _sender,
        address _recipient,
        string memory _key
    ) public view returns (string memory) {
        return graph[_sender][_recipient][Bytes32(_key)];
    }

    function isMutual(
        address _sender,
        address _recipient,
        string memory _key
    ) public view returns (bool) {
        return
            Bytes32(graph[_sender][_recipient][Bytes32(_key)]) ==
            Bytes32(graph[_recipient][_sender][Bytes32(_key)]);
    }

    function approve(
        address _editor,
        string memory _key,
        bool _value
    ) public {
        approved[msg.sender][_editor][Bytes32(_key)] = _value;
        emit ApprovalChanged(msg.sender, _editor, _key, _value);
    }

    function canEdit(
        address _target,
        address _editor,
        string memory _key
    ) public view returns (bool) {
        return approved[_target][_editor][Bytes32(_key)];
    }

    /// ------------------------------------------------------------------------
    /// Utility Functions
    /// ------------------------------------------------------------------------

    function Bytes32(string memory _input) internal pure returns (bytes32) {
        return keccak256(abi.encode(_input));
    }
}
