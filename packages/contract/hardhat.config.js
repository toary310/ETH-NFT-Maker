require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });

/**
 * Hardhat configuration for ETH-NFT-Maker project
 * 
 * This configuration supports:
 * - Local development with Hardhat network
 * - Sepolia testnet deployment using Alchemy
 * - Environment variable management for secure key handling
 * 
 * Required environment variables:
 * - ALCHEMY_API_KEY: Your Alchemy API key for Sepolia network
 * - PRIVATE_KEY: Your wallet private key (without 0x prefix)
 * - SEPOLIA_RPC_URL: Sepolia RPC URL (optional, defaults to Alchemy)
 */

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable intermediate representation for better optimization
    },
  },
  
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
    },
    
    // Sepolia testnet configuration
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
      gas: "auto",
    },
  },
  
  // Optional: Etherscan verification configuration
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  
  // Gas reporting configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  
  // Path configurations
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  // Mocha test configuration
  mocha: {
    timeout: 40000,
  },
};
