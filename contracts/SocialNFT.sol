// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// ----------------------------------------------------------------------------
/// Overview
/// ----------------------------------------------------------------------------

// function mint(address to)   
// function setBaseURI(string calldata _bURI)   
// function setExternalURI(string calldata _eURI)   
// function tokenURI(uint256 _tokenId) 
// function withdraw()  
// function withdrawToken()  

/// ----------------------------------------------------------------------------
/// Library Imports
/// ----------------------------------------------------------------------------
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

// import "hardhat/console.sol";

/// ----------------------------------------------------------------------------
/// Contract Imports
/// ----------------------------------------------------------------------------
import { Social } from "./Social.sol";

/// ----------------------------------------------------------------------------
/// Errors
/// ----------------------------------------------------------------------------
error invalidTokenId();
error withdrawFailed();

/**
 * @title ERC721E
 * @dev Generic ERC721Enumerable implement 
 */

contract SocialNFT is ERC721Enumerable, Ownable {
  /// ------------------------------------------------------------------------
  /// External Contract References
  /// ------------------------------------------------------------------------
  using Strings for uint256; // inherited from ERC721Enumerable

  /// ------------------------------------------------------------------------
  /// Events
  /// ------------------------------------------------------------------------
  event BaseURISet(string baseURI);
  event ExternalURISet(string externalURI);

  /// ------------------------------------------------------------------------
  /// Variables
  /// ------------------------------------------------------------------------
  string public constant nftName = "SocialNFT";
  string public constant nftSymbol = "SocialNFT";
  string public constant nftDescription = "Social Contract NFT";

  string public baseURI;
  string public externalURI;
  address public socialContract;

  /// ------------------------------------------------------------------------
  /// Constructor
  /// ------------------------------------------------------------------------
  
  /**
   * @param _bURI assigns to baseURI for metadata generation
   * @param _eURI assigns to externalURI for metadata generation
   * @dev Calls base contract constructor with long name and symbol
   */
  constructor(string memory _bURI, string memory _eURI, address _socialContract) ERC721(nftName, nftSymbol) {
    baseURI = _bURI;
    externalURI = _eURI;
	socialContract = _socialContract;
  }

  /// ------------------------------------------------------------------------
  /// Social NFT Functionality
  /// ------------------------------------------------------------------------

  function invite(address _user) public onlyOwner {
	Social social = Social(socialContract);
	social.set(address(this), _user, 'mintList:invited', 'true');
  }

  /// ------------------------------------------------------------------------
  /// Basic NFT Functionality
  /// ------------------------------------------------------------------------

  /**
   * @param _to Address to receive the NFT
   * @param _quantity number of nfts to mint to target address
   * @dev honestly, should override _mint to batch mint cheaper
   * @dev but OZ contracts have key variables marked private
   */
  function mint(address _to, uint256 _quantity) public {
	Social social = Social(socialContract);
	require(social.isMutual(address(this), msg.sender, 'mintList:invited'), 'mintList:invited Mutual Assertion failed');
    for(uint256 i = 0; i < _quantity; i++) {
      _mint(_to, totalSupply());
    }
  }

  /**
  * @param _bURI baseURI to be used to retreive image data
  */
  function setBaseURI(string calldata _bURI) public onlyOwner {
    baseURI = _bURI;
    emit BaseURISet(baseURI);
  }

  /**
  * @param _eURI alternate externalURI base to be used to view the NFT
  * @dev this is an opensea metadata option; may not be supported elsewhere
  * @dev https://docs.opensea.io/docs/metadata-standards
  */
  function setExternalURI(string calldata _eURI) public onlyOwner {
    externalURI = _eURI;
    emit ExternalURISet(externalURI);
  }

  /**
  * @param _tokenId Token index of the json metadata to retrieve
  */
  function tokenURI(uint256 _tokenId)
    public
    view
    override
    returns (string memory)
  {
    if (_exists(_tokenId) == false) revert invalidTokenId();
    return bytes(_baseURI()).length > 0 ? _getMetadata(_tokenId) : "";
  }

  /**
  * @param _tokenId Token index of the json metadata to generate
  * @dev Returned data is base64 encoded
  */
  function _getMetadata(uint256 _tokenId)
    internal
    view
    returns (string memory)
  {
    string memory tokenIdString = Strings.toString(_tokenId);

    string memory nftJson = string(
      abi.encodePacked(
        '{"name":"',
        nftName,
        '","description":"',
        nftDescription,
        '","image":"',
        baseURI,
        tokenIdString,
        '.png","external_url":"',
        externalURI,
        tokenIdString,
        '"}'
      )
    );

    string memory nftEncoded = Base64.encode(bytes(nftJson));
    return
      string(abi.encodePacked("data:application/json;base64,", nftEncoded));
  }

  /**
  * @dev used to retrieve all ETH from the contract. multisig friendly.
  */
  function withdraw() public onlyOwner {
    (bool sent, ) = msg.sender.call{value: address(this).balance}("");
    if (!sent) {
      revert withdrawFailed();
    }
  }

  /**
  * @param _token ERC20 token to retrieve
  * @dev used to retrieve all of an ERC20 token from the contract
  */
  function withdrawTokens(IERC20 _token) public onlyOwner {
    bool sent = _token.transfer(msg.sender, _token.balanceOf(address(this)));
    if (!sent) {
      revert withdrawFailed();
    }
  }

  /**
  * @dev glue logic for ERC721Enumerable
  */
  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }
}

/// ----------------------------------------------------------------------------
/// Libraries
/// ----------------------------------------------------------------------------

// Primes NFT
//https://etherscan.io/address/0xBDA937F5C5f4eFB2261b6FcD25A71A1C350FdF20#code#L1507
library Base64 {
  string internal constant TABLE_ENCODE =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  function encode(bytes memory data) internal pure returns (string memory) {
    if (data.length == 0) return "";

    // load the table into memory
    string memory table = TABLE_ENCODE;

    // multiply by 4/3 rounded up
    uint256 encodedLen = 4 * ((data.length + 2) / 3);

    // add some extra buffer at the end required for the writing
    string memory result = new string(encodedLen + 32);

    assembly {
      // set the actual output length
      mstore(result, encodedLen)

      // prepare the lookup table
      let tablePtr := add(table, 1)

      // input ptr
      let dataPtr := data
      let endPtr := add(dataPtr, mload(data))

      // result ptr, jump over length
      let resultPtr := add(result, 32)

      // run over the input, 3 bytes at a time
      for {

      } lt(dataPtr, endPtr) {

      } {
        // read 3 bytes
        dataPtr := add(dataPtr, 3)
        let input := mload(dataPtr)

        // write 4 characters
        mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
        resultPtr := add(resultPtr, 1)
        mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
        resultPtr := add(resultPtr, 1)
        mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
        resultPtr := add(resultPtr, 1)
        mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
        resultPtr := add(resultPtr, 1)
      }

      // padding with '='
      switch mod(mload(data), 3)
      case 1 {
        mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
      }
      case 2 {
        mstore(sub(resultPtr, 1), shl(248, 0x3d))
      }
    }

    return result;
  }
}