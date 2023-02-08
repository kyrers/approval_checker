import { ethers } from "ethers";

export const ERC20_APPROVAL_TOPIC = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";
export const ERC721_APPROVAL_TOPIC = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";
export const ERC721_APPROVAL_FOR_ALL_TOPIC = "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31";
export const ERC1155_APPROVAL_FOR_ALL_TOPIC = "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31";
export const ALL_APPROVAL_TOPICS = [ERC20_APPROVAL_TOPIC, ERC721_APPROVAL_TOPIC, ERC721_APPROVAL_FOR_ALL_TOPIC, ERC1155_APPROVAL_FOR_ALL_TOPIC];
export const FALLBACK_INTERFACE = new ethers.utils.Interface([
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"]
);