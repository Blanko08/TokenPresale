const Token = artifacts.require("Token");
const Presale = artifacts.require("Presale");

module.exports = async function (deployer) {
  // Deploy Token
  await deployer.deploy(Token);
  const token = await Token.deployed();

  // Deploy Presale
  await deployer.deploy(Presale, token.address);
  const presale = await Presale.deployed();

  // Envía 1 millón de tokens al contrato del Presale
  await token.transfer(presale.address, '1000000000000000000000000');
};