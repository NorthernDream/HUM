import React, { useState } from 'react';
import { Button, message, Card, Typography } from 'antd';
import { ethers } from 'ethers';
import VoiceNFTArtifact from '../contracts/VoiceNFT.json';
import { VOICE_NFT_ADDRESS, CHAIN_ID, CHAIN_CONFIG } from '../config/web3';

const { Text } = Typography;

interface VoiceNFTMintProps {
  voiceId: string;
  embeddingHash: string;
}

const VoiceNFTMint: React.FC<VoiceNFTMintProps> = ({ voiceId, embeddingHash }) => {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleMint = async () => {
    // @ts-ignore
    if (!window.ethereum) {
      message.error("Please install MetaMask!");
      return;
    }

    setLoading(true);
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Check network
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== CHAIN_ID) {
        try {
          // @ts-ignore
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_CONFIG.chainId }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              // @ts-ignore
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [CHAIN_CONFIG],
              });
            } catch (addError) {
              message.error("Failed to add network");
              setLoading(false);
              return;
            }
          } else {
            message.error("Failed to switch network");
            setLoading(false);
            return;
          }
        }
      }

      // Check if contract address is set
      if (VOICE_NFT_ADDRESS === "0x0000000000000000000000000000000000000000") {
         message.error("Contract not deployed yet. Please deploy the contract first.");
         setLoading(false);
         return;
      }

      const contract = new ethers.Contract(VOICE_NFT_ADDRESS, VoiceNFTArtifact.abi, signer);

      // Generate a simple metadata URI (in production, upload to IPFS/Arweave/0G Storage)
      const metadata = {
        name: `Voice ${voiceId}`,
        description: "Voice NFT on 0G Testnet",
        attributes: [
            { trait_type: "Voice ID", value: voiceId },
            { trait_type: "Embedding Hash", value: embeddingHash }
        ]
      };
      // For now, we just pass a data URI or empty string as user didn't specify storage
      const tokenURI = "data:application/json;base64," + btoa(JSON.stringify(metadata));

      const tx = await contract.mint(await signer.getAddress(), voiceId, embeddingHash, tokenURI);
      message.info("Transaction submitted: " + tx.hash);

      await tx.wait();
      setTxHash(tx.hash);
      message.success("Voice NFT Minted Successfully!");

    } catch (error: any) {
      console.error(error);
      message.error("Minting failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      bordered={false}
      style={{ 
        marginTop: 32,
        background: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(44, 62, 80, 0.08)',
      }}
      bodyStyle={{ padding: '32px' }}
    >
      <h3 style={{ 
        margin: '0 0 24px 0', 
        fontSize: '18px', 
        fontWeight: 600,
        color: '#2C3E50',
      }}>
        Mint Voice NFT on 0G Testnet
      </h3>
      
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: '13px', color: '#6C757D', fontWeight: 500 }}>Voice ID</span>
          <div style={{ 
            marginTop: 4,
            padding: '8px 12px',
            background: '#F8F9FA',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#2C3E50',
            wordBreak: 'break-all',
          }}>
            {voiceId}
          </div>
        </div>
        
        <div>
          <span style={{ fontSize: '13px', color: '#6C757D', fontWeight: 500 }}>Embedding Hash</span>
          <div style={{ 
            marginTop: 4,
            padding: '8px 12px',
            background: '#F8F9FA',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#2C3E50',
            wordBreak: 'break-all',
          }}>
            {embeddingHash}
          </div>
        </div>
      </div>
      
      <Button 
        type="primary" 
        onClick={handleMint} 
        loading={loading}
        size="large"
        style={{ 
          height: '48px',
          borderRadius: '8px',
          fontWeight: 500,
        }}
      >
        Mint NFT
      </Button>
      
      {txHash && (
        <div style={{ 
          marginTop: 20,
          padding: '16px',
          background: '#F8F9FA',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#27AE60', fontWeight: 500, fontSize: '14px' }}>Minted Successfully! </span>
          <a 
            href={`${CHAIN_CONFIG.blockExplorerUrls[0]}/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#3498DB',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >   
            View on Explorer →
          </a>
        </div>
      )}
    </Card>
  );
};

export default VoiceNFTMint;
