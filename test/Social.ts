import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MinEthersFactory } from "../typechain-types/common";

describe("Social", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deploySocialContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Social = await ethers.getContractFactory("Social");
    const social = await Social.deploy();

    return { social, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { social, owner } = await loadFixture(deploySocialContract);

      expect(await social.owner()).to.equal(owner.address);
    });
  });

  describe("Self Attestation", function () {
    it("Should set and get correct value for self, on self", async function () {
      const { social, owner } = await loadFixture(deploySocialContract);
      await social.set(owner.address, owner.address, "gm", "gm");

      expect(
        await social.get(owner.address, owner.address, "gm")
      ).to.deep.equal("gm");
    });
    it("Should emit EdgeAdded", async function () {
      const { social, owner } = await loadFixture(deploySocialContract);
      expect(
        await social.set(owner.address, owner.address, "gm", "gm")
      ).to.emit(social, "EdgeAdded");
    });
    it("Should change value for self, on self", async function () {
      const { social, owner } = await loadFixture(deploySocialContract);
      await social.set(owner.address, owner.address, "gm", "gm");
      await social.set(owner.address, owner.address, "gm", "gn");

      expect(
        await social.get(owner.address, owner.address, "gm")
      ).to.deep.equal("gn");
    });
  });

  describe("Unilateral Attestation", function () {
    it("Should set and get correct value for another address, on self", async function () {
      const { social, owner, otherAccount } = await loadFixture(
        deploySocialContract
      );
      await social.set(
        owner.address,
        otherAccount.address,
        "alphaTester:invited",
        "0x01"
      );

      expect(
        await social.get(
          owner.address,
          otherAccount.address,
          "alphaTester:invited"
        )
      ).to.equal("0x01");
      it("Should emit EdgeAdded", async function () {
        const { social, otherAccount } = await loadFixture(
          deploySocialContract
        );
        expect(
          await social.set(
            owner.address,
            otherAccount.address,
            "alphaTester:invited",
            "0x01"
          )
        ).to.emit(social, "EdgeAdded");
      });
    });
    it("Should change value for another address, on self", async function () {
      const { social, owner, otherAccount } = await loadFixture(
        deploySocialContract
      );
      await social.set(
        owner.address,
        otherAccount.address,
        "alphaTester:invited",
        "0x01"
      );
      await social.set(
        owner.address,
        otherAccount.address,
        "alphaTester:invited",
        "0x00"
      );

      expect(
        await social.get(
          owner.address,
          otherAccount.address,
          "alphaTester:invited"
        )
      ).to.equal("0x00");
    });
    it("Should fail to set value for self, on another address", async function () {
      const { social, owner, otherAccount } = await loadFixture(
        deploySocialContract
      );

      await expect(
        social.set(
          otherAccount.address,
          owner.address,
          "alphaTester:invited",
          "0x01"
        )
      ).to.be.revertedWith("Not Authorized to Edit");
    });
  });

  describe("Bidirectional Attestation", function () {
    it("Should set and confirm mutual attestation", async function () {
      const { social, owner, otherAccount } = await loadFixture(
        deploySocialContract
      );
      await social.set(
        owner.address,
        otherAccount.address,
        "alphaTester:invited",
        "0x01"
      );
      await social
        .connect(otherAccount)
        .set(
          otherAccount.address,
          owner.address,
          "alphaTester:invited",
          "0x01"
        );

      expect(
        await social.isMutual(
          owner.address,
          otherAccount.address,
          "alphaTester:invited"
        )
      ).to.be.true;
    });
    it("Should emit EdgeAdded twice", async function () {
      const { social, owner, otherAccount } = await loadFixture(
        deploySocialContract
      );
      expect(
        await social.set(
          owner.address,
          otherAccount.address,
          "alphaTester:invited",
          "0x01"
        )
      ).to.emit(social, "EdgeAdded");
      expect(
        await social
          .connect(otherAccount)
          .set(
            otherAccount.address,
            owner.address,
            "alphaTester:invited",
            "0x01"
          )
      ).to.emit(social, "EdgeAdded");
    });
    it("Should not confirm mutual attestation on unilateral attestation", async function () {
      const { social, owner, otherAccount } = await loadFixture(
        deploySocialContract
      );
      await social.set(
        owner.address,
        otherAccount.address,
        "alphaTester:invited",
        "0x01"
      );

      expect(
        await social.isMutual(
          owner.address,
          otherAccount.address,
          "alphaTester:invited"
        )
      ).to.be.false;
    });
    it("Should not confirm mutual attestation if a mutual attestation changes", async function () {
      const { social, owner, otherAccount } = await loadFixture(
        deploySocialContract
      );
      await social.set(
        owner.address,
        otherAccount.address,
        "alphaTester:invited",
        "0x01"
      );
      await social
        .connect(otherAccount)
        .set(
          otherAccount.address,
          owner.address,
          "alphaTester:invited",
          "0x01"
        );

      await social.set(
        owner.address,
        otherAccount.address,
        "alphaTester:invited",
        "0x00"
      );

      expect(
        await social.isMutual(
          owner.address,
          otherAccount.address,
          "alphaTester:invited"
        )
      ).to.be.false;
    });
  });

  describe("Unilateral Attestation with Approval", function () {
    it("Should grant permission to a specific key", async function () {
      const { social, owner, otherAccount } = await loadFixture(
        deploySocialContract
      );
      await social.approve(otherAccount.address, "alphaTester:invited", true);

      expect(
        await social.canEdit(
          owner.address,
          otherAccount.address,
          "alphaTester:invited"
        )
      ).to.be.true;
    });
    it("Should emit ApprovalChanged", async function () {
      const { social, otherAccount } = await loadFixture(deploySocialContract);
      expect(
        await social.approve(otherAccount.address, "alphaTester:invited", true)
      ).to.emit(social, "ApprovalChanged");
    });
    it("Should fail to set value to a specific key on a remote address, without approval", async function () {
		const { social, owner, otherAccount } = await loadFixture(
		  deploySocialContract
		);

		await expect(
		  social
			.connect(otherAccount)
			.set(
			  owner.address,
			  otherAccount.address,
			  "alphaTester:invited",
			  "true"
			)
		).to.be.reverted;
	  });

    it("Should set value to a specific key on a remote address, after approved", async function () {
      const { social, owner, otherAccount } = await loadFixture(
        deploySocialContract
      );
      await social.approve(otherAccount.address, "alphaTester:invited", true);

      await expect(
        social
          .connect(otherAccount)
          .set(
            owner.address,
            otherAccount.address,
            "alphaTester:invited",
            "true"
          )
      ).to.not.be.reverted;
    });
  });
});
