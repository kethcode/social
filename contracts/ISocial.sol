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
interface ISocial {
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

    /// ------------------------------------------------------------------------
    /// Constructor
    /// ------------------------------------------------------------------------

    /// ------------------------------------------------------------------------
    /// Public Functions
    /// ------------------------------------------------------------------------
    function set(
        address _sender,
        address _recipient,
        string memory _key,
        string memory _value
    ) external;

    function get(
        address _sender,
        address _recipient,
        string memory _key
    ) external view returns (string memory);

    function isMutual(
        address _sender,
        address _recipient,
        string memory _key
    ) external view returns (bool);

    function approve(
        address _editor,
        string memory _key,
        bool _value
    ) external;

    function canEdit(
        address _target,
        address _editor,
        string memory _key
    ) external view returns (bool);
}
