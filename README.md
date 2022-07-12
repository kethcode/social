# The Social Contract

	The Social Contract is a relationship map between addresses. Keys are hashed
	and used to index the mapping. Values are stored raw for retrieval.

	Anticipated Common Use Cases:
		set (self, self, 'profile:avatar', 'nftAddress,tokenId');
		get (contract, contract, 'keyList');

		set (contract, user, 'member', 'true');
		set (user, contract, 'member' 'true');
		isMutual (contract, user, 'member');

		approve (contract, 'reputation', true);
		canEdit (contract, user, 'reputation');
		set(user, contract, 'reputation', '100');	 from contract
		set(contract, user, 'reputation', '100');	 from contract

	Function ToC:
		set(address _sender, address _recipient, string memory _key, string memory _value)
		get(address _sender, address _recipient, string memory _key) returns (string memory)
		isMutual( address _sender, address _recipient, string memory _key) returns (bool)
		approve(address _recipient, string memory _key, bool _value)
		canEdit(address _sender, address _recipient, string memory _key) returns (bool)

```

  Social
    Deployment
      ✓ Should set the right owner
    Self Attestation
      ✓ Should set and get correct value for self, on self
      ✓ Should emit EdgeAdded
      ✓ Should change value for self, on self
    Unilateral Attestation
      ✓ Should set and get correct value for another address, on self
      ✓ Should change value for another address, on self
      ✓ Should fail to set value for self, on another address
    Bidirectional Attestation
      ✓ Should set and confirm mutual attestation
      ✓ Should emit EdgeAdded twice
      ✓ Should not confirm mutual attestation on unilateral attestation
      ✓ Should not confirm mutual attestation if a mutual attestation changes
    Unilateral Attestation with Approval
      ✓ Should grant permission to a specific key
      ✓ Should emit ApprovalChanged
      ✓ Should fail to set value to a specific key on a remote address, without approval
      ✓ Should set value to a specific key on a remote address, after approved
      ✓ Should set value to a specific key on a remote address, if ApproveAll

·-------------------------|---------------------------|-------------|-----------------------------·
|   Solc version: 0.8.9   ·  Optimizer enabled: true  ·  Runs: 300  ·  Block limit: 30000000 gas  │
··························|···························|·············|······························
|  Methods                                                                                        │
·············|············|·············|·············|·············|···············|··············
|  Contract  ·  Method    ·  Min        ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
·············|············|·············|·············|·············|···············|··············
|  Social    ·  approve   ·      48259  ·      48367  ·      48340  ·            4  ·          -  │
·············|············|·············|·············|·············|···············|··············
|  Social    ·  set       ·      35672  ·      56561  ·      49464  ·           22  ·          -  │
·············|············|·············|·············|·············|···············|··············
|  Deployments            ·                                         ·  % of limit   ·             │
··························|·············|·············|·············|···············|··············
|  Social                 ·          -  ·          -  ·     579666  ·        1.9 %  ·          -  │
·-------------------------|-------------|-------------|-------------|---------------|-------------·

```

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
