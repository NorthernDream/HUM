const { ethers } = require("ethers");
const errors = [
  "ERC721IncorrectOwner(address,uint256,address)",
  "ERC721InsufficientApproval(address,uint256)",
  "ERC721InvalidApprover(address)",
  "ERC721InvalidOperator(address)",
  "ERC721InvalidOwner(address)",
  "ERC721InvalidReceiver(address)",
  "ERC721InvalidSender(address)",
  "ERC721NonexistentToken(uint256)",
  "OwnableInvalidOwner(address)",
  "OwnableUnauthorizedAccount(address)"
];
errors.forEach(e => console.log(e, ethers.id(e).slice(0, 10)));
