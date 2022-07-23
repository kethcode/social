import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
// import { MinEthersFactory } from "../typechain-types/common";

describe("Social", function () {
  async function deploySocialContract() {
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

    it("Should set value to a specific key on a remote address, if ApproveAll", async function () {
      const { social, owner, otherAccount } = await loadFixture(
        deploySocialContract
      );
      await social.approve(otherAccount.address, "ApproveAll", true);

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

describe("App Example", function () {
  async function deployAppExample() {
    const [owner, org, user1, user2] = await ethers.getSigners();

    const Social = await ethers.getContractFactory("Social");
    const social = await Social.deploy();

    const NFT = await ethers.getContractFactory("SocialNFT");
    const nft = await NFT.deploy(
      "https://localhost:4200/",
      "https://localhost:4201/",
      social.address
    );

    return { social, nft, owner, user1, user2 };
  }

  describe("Simple Mintlist", function () {
    it("SocialNFT should add user1 to invite list", async function () {
      const { social, nft, owner, user1, user2 } = await loadFixture(
        deployAppExample
      );

      await nft.invite(user1.address);

      expect(
        await social.get(nft.address, user1.address, "mintList:invited")
      ).to.deep.equal("true");
    });

    it("User1 can see that they are invited", async function () {
      const { social, nft, owner, user1, user2 } = await loadFixture(
        deployAppExample
      );

      await nft.invite(user1.address);
      expect(
        await social
          .connect(user1)
          .get(nft.address, user1.address, "mintList:invited")
      ).to.deep.equal("true");
    });

    it("User2 can see that they are not invited", async function () {
      const { social, nft, owner, user1, user2 } = await loadFixture(
        deployAppExample
      );

      await nft.invite(user1.address);
      expect(
        await social
          .connect(user2)
          .get(nft.address, user2.address, "mintList:invited")
      ).to.not.equal("true");
    });

    it("User1 can accept the invitation (self assert and check mutual)", async function () {
      const { social, nft, owner, user1, user2 } = await loadFixture(
        deployAppExample
      );

      await nft.invite(user1.address);
      await social
        .connect(user1)
        .get(nft.address, user1.address, "mintList:invited");
      await social
        .connect(user1)
        .set(user1.address, nft.address, "mintList:invited", "true");

      expect(
        await social
          .connect(user1)
          .isMutual(nft.address, user1.address, "mintList:invited")
      ).to.be.true;
    });

    it("User2 can not accept the invitation (self assert and fail mutual check)", async function () {
      const { social, nft, owner, user1, user2 } = await loadFixture(
        deployAppExample
      );

      await social
        .connect(user2)
        .set(user2.address, nft.address, "mintList:invited", "true");
      expect(
        await social
          .connect(user2)
          .isMutual(nft.address, user2.address, "mintList:invited")
      ).to.be.false;
    });

    it("User1 can mint (SocialNFT checks mutual and allows mint)", async function () {
      const { social, nft, owner, user1, user2 } = await loadFixture(
        deployAppExample
      );

      await nft.invite(user1.address);
      await social
        .connect(user1)
        .get(nft.address, user1.address, "mintList:invited");
      await social
        .connect(user1)
        .set(user1.address, nft.address, "mintList:invited", "true");

      expect(await nft.connect(user1).mint(user1.address, 1)).to.not.be
        .reverted;
    });

    it("User2 cannot mint (SocialNFT checks mutual and does not allow mint)", async function () {
      const { social, nft, owner, user1, user2 } = await loadFixture(
        deployAppExample
      );

      await social
        .connect(user2)
        .set(user2.address, nft.address, "mintList:invited", "true");

      await expect(nft.connect(user2).mint(user2.address, 1)).to.be.reverted;
    });
  });
});
