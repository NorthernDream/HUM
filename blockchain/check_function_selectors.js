const { ethers } = require("ethers");
const functions = [
  "mint(address,string,string,string)",
  "getVoiceData(uint256)",
  "owner()",
  "renounceOwnership()",
  "transferOwnership(address)",
  "approve(address,uint256)",
  "setApprovalForAll(address,bool)",
  "transferFrom(address,address,uint256)",
  "safeTransferFrom(address,address,uint256)",
  "safeTransferFrom(address,address,uint256,bytes)",
  "balanceOf(address)",
  "ownerOf(uint256)",
  "getApproved(uint256)",
  "isApprovedForAll(address,address)",
  "tokenURI(uint256)",
  "supportsInterface(bytes4)",
  "name()",
  "symbol()"
];
functions.forEach(f => {
    const hash = ethers.id(f).slice(0, 10);
    if (hash === "0x4a0706be") {
        console.log("MATCH FOUND:", f, hash);
    } else {
        // console.log(f, hash);
    }
});
