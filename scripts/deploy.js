const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting OmniLend deployment...");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    // Fixed: await the getBalance() call for ethers v6
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    // Deploy OmniLendCore
    console.log("\n1️⃣ Deploying OmniLendCore...");
    const OmniLendCore = await ethers.getContractFactory("OmniLendCore");
    const omniLend = await OmniLendCore.deploy();
    await omniLend.waitForDeployment();
    
    // Fixed: Get address using await
    const contractAddress = await omniLend.getAddress();
    console.log("✅ OmniLendCore deployed to:", contractAddress);

    // Add lending pools
    console.log("\n2️⃣ Adding lending pools...");
    const chains = [
        { id: 1, name: "Ethereum" },
        { id: 137, name: "Polygon" },
        { id: 56, name: "BSC" },
        { id: 43114, name: "Avalanche" }
    ];
    
    for (const chain of chains) {
        await omniLend.addLendingPool(chain.id, ethers.ZeroAddress);
        console.log(`✅ Added pool for ${chain.name} (Chain ID: ${chain.id})`);
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Address:");
    console.log("OmniLendCore:", contractAddress);
    
    console.log("\n📝 SAVE THIS ADDRESS FOR FRONTEND:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
