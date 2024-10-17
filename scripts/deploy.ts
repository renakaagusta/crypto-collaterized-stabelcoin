import hre, { network } from "hardhat";
import fs from "fs";

// Colour codes for terminal prints
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
async function main() {
  try {
    const stabilConstructorArgs = ["Stabil", "STB"];
    const stabilContract = await hre.ethers.deployContract("Stabil");

    await stabilContract.waitForDeployment();
    const stabilContractAddress = await stabilContract.getAddress();

    const collateralStabilConstructorArgs = ["CollateralStabil", "CSTB"];
    const collateralStabilContract = await hre.ethers.deployContract("CollateralStabil");

    await collateralStabilContract.waitForDeployment();
    const collateralStabilContractAddress = await collateralStabilContract.getAddress();

    const collateralRatio = 120;
    const liquidationRatio = 150;
    const collateralPrice = 2;

    const vaultConstructorArgs = [stabilContractAddress, collateralStabilContractAddress, collateralRatio, liquidationRatio, collateralPrice];
    const vaultContract = await hre.ethers.deployContract("Vault", vaultConstructorArgs);

    await vaultContract.waitForDeployment();
    const vaultContractAddress = await vaultContract.getAddress();

    const stabilContractInstance = await hre.ethers.getContractAt("Stabil", stabilContractAddress);

    // const tx = await stabilContractInstance.setVault(vaultContractAddress);
    // await tx.wait();

    console.log("Stabil deployed to: " + `${stabilContractAddress}\n`);
    console.log("Stabil Collateral deployed to: " + `${collateralStabilContractAddress}\n`);
    console.log("Vault deployed to: " + `${vaultContractAddress}\n`);

    // if(network.name !== 'localhost') {
    //   await hre.run("verify:verify", {
    //     address: stabilContractAddress,
    //     constructorArguments: stabilConstructorArgs,
    //   });
    //   await hre.run("verify:verify", {
    //     address: collateralStabilContractAddress,
    //     constructorArguments: collateralStabilConstructorArgs,
    //   });
    //   await hre.run("verify:verify", {
    //     address: vaultContractAddress,
    //     constructorArguments: vaultConstructorArgs,
    //   });
    // }

    // Read existing deployments
    const deploymentsFile = 'deployments.json';
    let deployments: Record<string, Record<string, string>> = {};

    if (fs.existsSync(deploymentsFile)) {
      deployments = JSON.parse(fs.readFileSync(deploymentsFile, 'utf8')) as unknown as Record<string, Record<string, string>>;
    }

    // Update deployments with the new contract
    deployments["Stabil"]= deployments["Stabil"] != null ? {
      ...deployments["Stabil"],
      [new Date().toISOString()]: stabilContractAddress
    } : {
      [new Date().toISOString()]: stabilContractAddress
    };
    
    // Update deployments with the new contract
    deployments["CollateralStabil"]= deployments["CollateralStabil"] != null ? {
      ...deployments["CollateralStabil"],
      [new Date().toISOString()]: collateralStabilContractAddress
    } : {
      [new Date().toISOString()]: collateralStabilContractAddress
    };

    // Update deployments with the new contract
    deployments["Vault"]= deployments["Vault"] != null ? {
      ...deployments["Vault"],
      [new Date().toISOString()]: vaultContractAddress
    } : {
      [new Date().toISOString()]: vaultContractAddress
    };

    // Write back to the file
    fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));

    console.log(`Deployment information saved to ${deploymentsFile}`);

    // Uncomment if you want to enable the `tenderly` extension
    await hre.tenderly.verify({
      name: "Stabil",
      address: stabilContractAddress,
    });
    await hre.tenderly.verify({
      name: "CollateralStabil",
      address: collateralStabilContractAddress,
    });
    await hre.tenderly.verify({
      name: "Vault",
      address: vaultContractAddress,
    });
  } catch(e) {
    console.log('error', (e as unknown as Error).toString());
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
