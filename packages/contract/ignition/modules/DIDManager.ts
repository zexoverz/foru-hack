import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DIDManagerModule", (m) => {
  const manager = m.contract("DIDManager");

  return { manager };
});
