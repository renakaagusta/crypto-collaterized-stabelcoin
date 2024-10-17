// An example script that shows how to interact programmatically with a deployed contract
// You must customise it according to your contract's specifications
import hre from "hardhat";

// Colour codes for terminal prints
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";

async function main() {
  const address = "0x35FFb31c734A1399FCe34F20De610f03f3f4c0B2"; // Specify here your contract address
  const contract = await hre.ethers.getContractAt("Greeter", address); // Specify here your contract name

  ////////////////
  //  PAYLOAD  //
  //////////////

  const newGreeting = "Buongiorno!"; // Specify here the payload of the to-be-called function

  ////////////////
  //  SENDING  //
  //////////////

  const tx = await contract.setGreeting(newGreeting); // Specify here the to-be-called function name
  console.log("The transaction hash is: " + `${GREEN}${tx.hash}${RESET}\n`);
  console.log("Waiting until the transaction is confirmed...\n");
  const receipt = await tx.wait(); // Wait until the transaction is confirmed
  const deployedAddress = await contract.getAddress()
  console.log(
    "The transaction returned the following transaction receipt:\n",
    receipt,
    address
  );
}

// To run it, invoke `npx hardhat run scripts/interact.ts --network <network_name>`
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
