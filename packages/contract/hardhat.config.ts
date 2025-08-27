import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";

const privateKey = process.env.SEPOLIA_PRIVATE_KEY!;

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: "0.8.30",
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [privateKey],
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY!,
    },
  },
};

export default config;
