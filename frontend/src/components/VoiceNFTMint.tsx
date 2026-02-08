import React, { useState } from 'react';
import { Button, message, Card, Typography, Tabs, Input, Form, Divider, Descriptions, Space } from 'antd';
import { ethers } from 'ethers';
import VoiceNFTArtifact from '../contracts/VoiceNFT.json';
import { VOICE_NFT_ADDRESS, CHAIN_ID, CHAIN_CONFIG } from '../config/web3';

const { Text, Paragraph } = Typography;

interface VoiceNFTMintProps {
  voiceId: string;
  embeddingHash: string;
}

const VoiceNFTMint: React.FC<VoiceNFTMintProps> = ({ voiceId, embeddingHash }) => {
  const [loading, setLoading] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Manage & Restore State
  const [tokenIdToManage, setTokenIdToManage] = useState<string>('');
  const [retrievedData, setRetrievedData] = useState<{ voiceId: string; embeddingHash: string } | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>('');

  const getProviderAndSigner = async () => {
    // @ts-ignore
    if (!window.ethereum) {
      throw new Error("Please install MetaMask!");
    }
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
        if (switchError.code === 4902) {
          // @ts-ignore
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CHAIN_CONFIG],
          });
        } else {
          throw new Error("Failed to switch network");
        }
      }
    }
    return { provider, signer };
  };

  const handleMint = async () => {
    setLoading(true);
    setMintedTokenId(null);
    setTxHash(null);
    try {
      const { signer } = await getProviderAndSigner();
      
      if (VOICE_NFT_ADDRESS.startsWith("0x0000000000000000000000000000000000000000")) {
         throw new Error("Contract not deployed yet.");
      }

      const contract = new ethers.Contract(VOICE_NFT_ADDRESS, VoiceNFTArtifact.abi, signer);

      const metadata = {
        name: `Voice ${voiceId}`,
        description: "Voice NFT on 0G Testnet",
        attributes: [
            { trait_type: "Voice ID", value: voiceId },
            { trait_type: "Embedding Hash", value: embeddingHash }
        ]
      };
      const tokenURI = "data:application/json;base64," + btoa(JSON.stringify(metadata));

      const tx = await contract.mint(await signer.getAddress(), voiceId, embeddingHash, tokenURI, {
        gasLimit: 500000 // Manually set gas limit to avoid estimation errors on testnet
      });
      message.info("Transaction submitted: " + tx.hash);
      
      const receipt = await tx.wait();
      setTxHash(tx.hash);

      // Find Token ID from logs
      // Event: Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
      // topic[0] is hash, topic[1] is from, topic[2] is to, topic[3] is tokenId
      const transferLog = receipt.logs.find((log: any) => 
        log.address.toLowerCase() === VOICE_NFT_ADDRESS.toLowerCase() && log.topics.length === 4
      );

      if (transferLog) {
          const tokenId = BigInt(transferLog.topics[3]).toString();
          setMintedTokenId(tokenId);
          setTokenIdToManage(tokenId); // Auto-fill manage tab
          message.success(`Voice NFT Minted! Token ID: ${tokenId}`);
      } else {
          message.success("Voice NFT Minted! (Token ID not found in logs)");
      }

    } catch (error: any) {
      console.error(error);
      let errorMsg = error.reason || error.message || "Unknown error";
      // Handle weird RPC error returning calldata
      if (typeof errorMsg === 'string' && errorMsg.startsWith('0x')) {
          errorMsg = "Transaction failed. Please check your gas balance or network connection.";
      }
      message.error("Minting failed: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = async () => {
    if (!tokenIdToManage) {
        message.warning("Please enter a Token ID");
        return;
    }
    setLoading(true);
    try {
        const { signer } = await getProviderAndSigner();
        const contract = new ethers.Contract(VOICE_NFT_ADDRESS, VoiceNFTArtifact.abi, signer);
        
        // Call getVoiceData
        const [rVoiceId, rEmbeddingHash] = await contract.getVoiceData(tokenIdToManage);
        setRetrievedData({ voiceId: rVoiceId, embeddingHash: rEmbeddingHash });
        message.success("Data retrieved from 0G Chain!");
    } catch (error: any) {
        console.error(error);
        message.error("Fetch failed: " + (error.reason || error.message));
        setRetrievedData(null);
    } finally {
        setLoading(false);
    }
  };

  const handleTransfer = async () => {
      if (!tokenIdToManage || !recipientAddress) {
          message.warning("Please enter Token ID and Recipient Address");
          return;
      }
      setLoading(true);
      try {
        const { signer } = await getProviderAndSigner();
        const contract = new ethers.Contract(VOICE_NFT_ADDRESS, VoiceNFTArtifact.abi, signer);
        const userAddress = await signer.getAddress();

        // safeTransferFrom is overloaded, so we use the function signature
        // Note: In ethers v6, we can try using the method name if unique or the typed way
        // "safeTransferFrom(address,address,uint256)"
        
        const tx = await contract["safeTransferFrom(address,address,uint256)"](userAddress, recipientAddress, tokenIdToManage);
        message.info("Transfer initiated: " + tx.hash);
        await tx.wait();
        message.success("NFT Transferred Successfully!");
        setRecipientAddress('');
      } catch (error: any) {
        console.error(error);
        message.error("Transfer failed: " + (error.reason || error.message));
      } finally {
        setLoading(false);
      }
  };

  const items = [
    {
      key: '1',
      label: 'Mint New NFT',
      children: (
        <div style={{ padding: '10px 0' }}>
            <div style={{ marginBottom: 16 }}>
                <Text strong>Voice ID:</Text> <Text code>{voiceId}</Text>
                <br />
                <Text strong>Embedding Hash:</Text> <Text code>{embeddingHash}</Text>
            </div>
            <Button type="primary" onClick={handleMint} loading={loading}>
                Mint NFT
            </Button>
            {txHash && (
                <div style={{ marginTop: 20 }}>
                    <Text type="success">Minted Successfully!</Text>
                    <br/>
                    {mintedTokenId && <Text strong style={{ fontSize: 16 }}>Token ID: {mintedTokenId}</Text>}
                    <br/>
                    <a href={`${CHAIN_CONFIG.blockExplorerUrls[0]}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                        View on Explorer
                    </a>
                </div>
            )}
        </div>
      ),
    },
    {
      key: '2',
      label: 'Manage & Restore',
      children: (
        <div style={{ padding: '10px 0' }}>
             <Paragraph>
                Enter the Token ID of an NFT you own to retrieve its Voice Data or transfer it to another user.
             </Paragraph>
             
             <Space direction="vertical" style={{ width: '100%' }}>
                <Input 
                    placeholder="Token ID (e.g. 0)" 
                    value={tokenIdToManage} 
                    onChange={e => setTokenIdToManage(e.target.value)} 
                />
                <Button onClick={handleFetchData} loading={loading}>
                    Fetch Voice Data (Restore)
                </Button>

                {retrievedData && (
                    <Card size="small" title="Restored Voice Data" style={{ marginTop: 10, borderColor: '#1890ff' }}>
                         <Descriptions column={1} size="small">
                            <Descriptions.Item label="Voice ID">
                                <Text copyable>{retrievedData.voiceId}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Embedding Hash">
                                <Text copyable ellipsis>{retrievedData.embeddingHash}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 10 }}>
                             <Button type="dashed" size="small" onClick={() => message.success("Voice Loaded into Application!")}>
                                Use This Voice
                             </Button>
                        </div>
                    </Card>
                )}

                <Divider orientation="left" style={{ borderColor: '#e8e8e8' }}>Transfer Ownership</Divider>
                <Input 
                    placeholder="Recipient Address (0x...)" 
                    value={recipientAddress}
                    onChange={e => setRecipientAddress(e.target.value)}
                />
                <Button danger onClick={handleTransfer} loading={loading} disabled={!tokenIdToManage || !recipientAddress}>
                    Transfer NFT
                </Button>
             </Space>
        </div>
      ),
    },
  ];

  return (
    <Card title="0G Voice NFT Manager" style={{ marginTop: 20 }}>
      <Tabs defaultActiveKey="1" items={items} />
    </Card>
  );
};

export default VoiceNFTMint;
