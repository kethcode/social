import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 300,
          },
        },
      },
    ],
  },
  networks: {
    // op_goerli: {
    //   url: process.env.ALCHEMY_KEY_OP_GOERLI,
    //   accounts:
    //     process.env.PRIVATE_KEY_OP_GOERLI !== undefined
    //       ? [process.env.PRIVATE_KEY_OP_GOERLI]
    //       : [],
    // },
    rinkeby: {
      url: process.env.ALCHEMY_KEY_RINKEBY,
      accounts:
        process.env.PRIVATE_KEY_RINKEBY !== undefined
          ? [process.env.PRIVATE_KEY_RINKEBY]
          : [],
    },
    // kovan: {
    //   url: process.env.ALCHEMY_KEY_KOVAN,
    //   accounts:
    //     process.env.PRIVATE_KEY_KOVAN !== undefined
    //       ? [process.env.PRIVATE_KEY_KOVAN]
    //       : [],
    // },
    // ropsten: {
    //   url: process.env.ROPSTEN_URL || "",
    //   accounts:
    //     process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    // },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY_RINKEBY,
  },
};

export default config;
