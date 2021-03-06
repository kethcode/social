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
import "./ISocial.sol";

/**
 * @title Social
 */
contract Social is ISocial {
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
    ) public override {
        require(
            (_sender == msg.sender) ||
                (canEdit(_sender, _recipient, _key)) ||
                (canEdit(_sender, _recipient, "ApproveAll")),
            "Not Authorized to Edit"
        );
        graph[_sender][_recipient][_stringToHash(_key)] = _value;
        emit EdgeAdded(_sender, _recipient, _key, _value);
    }

    function get(
        address _sender,
        address _recipient,
        string memory _key
    ) public view override returns (string memory) {
        return graph[_sender][_recipient][_stringToHash(_key)];
    }

    function isMutual(
        address _sender,
        address _recipient,
        string memory _key
    ) public view override returns (bool) {
        return
            _stringToHash(graph[_sender][_recipient][_stringToHash(_key)]) ==
            _stringToHash(graph[_recipient][_sender][_stringToHash(_key)]);
    }

    function approve(
        address _editor,
        string memory _key,
        bool _value
    ) public override {
        approved[msg.sender][_editor][_stringToHash(_key)] = _value;
        emit ApprovalChanged(msg.sender, _editor, _key, _value);
    }

    function canEdit(
        address _target,
        address _editor,
        string memory _key
    ) public view override returns (bool) {
        return approved[_target][_editor][_stringToHash(_key)];
    }

    /// ------------------------------------------------------------------------
    /// Utility Functions
    /// ------------------------------------------------------------------------

    function _stringToHash(string memory _input)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(_input));
    }
}
