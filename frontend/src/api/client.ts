import axios from 'axios';
// @ts-ignore
import { createPaymentHeader } from 'x402/client';
import { createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理 + X402 自动支付
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // X402 Payment Required — 自动处理支付后重试
    if (error.response?.status === 402) {
      const paymentData = error.response.data;

      // 检查是否是合法的 x402 格式
      if (paymentData?.x402Version && paymentData?.accepts?.length) {
        const ethereum = (window as any).ethereum;
        if (!ethereum) {
          return Promise.reject(new Error('需要安装 Web3 钱包（OKX / MetaMask）才能使用此功能'));
        }

        // 获取已连接的账户（不弹框，只读）
        let accounts: string[] = await ethereum.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) {
          // 未连接则主动请求授权
          accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        }
        if (!accounts || accounts.length === 0) {
          return Promise.reject(new Error('请先连接钱包'));
        }

        // 确保在 Base Sepolia 网络
        const chainId: string = await ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x14a34') {
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x14a34' }],
            });
          } catch (switchErr: any) {
            if (switchErr.code === 4902) {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x14a34',
                  chainName: 'Base Sepolia',
                  rpcUrls: ['https://sepolia.base.org'],
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  blockExplorerUrls: ['https://sepolia.basescan.org'],
                }],
              });
            } else {
              return Promise.reject(new Error('请切换到 Base Sepolia 网络后再试'));
            }
          }
        }

        try {
          // 使用连接账户创建 walletClient（account 必须显式设置）
          const walletClient = createWalletClient({
            account: accounts[0] as `0x${string}`,
            chain: baseSepolia,
            transport: custom(ethereum),
          });

          // 生成 X-PAYMENT 头（会调起钱包签名）
          const paymentHeader = await createPaymentHeader(
            walletClient as any,
            paymentData.x402Version,
            paymentData.accepts[0],
          );

          // 重试原请求，附带支付头
          const originalConfig = error.config;
          originalConfig.__is402Retry = true;
          originalConfig.headers['X-PAYMENT'] = paymentHeader;
          originalConfig.headers['Access-Control-Expose-Headers'] = 'X-PAYMENT-RESPONSE';
          const retryResponse = await apiClient.request(originalConfig);
          return retryResponse;
        } catch (paymentErr: any) {
          const msg = paymentErr?.message || '支付失败';
          if (msg.includes('rejected') || msg.includes('denied') || msg.includes('cancel')) {
            return Promise.reject(new Error('用户取消了支付'));
          }
          return Promise.reject(new Error(`支付处理失败：${msg}`));
        }
      }
    }

    // StepFun API 错误映射
    if (error.response?.data?.error?.code === 'invalid_api_key') {
      return Promise.reject(new Error('API密钥无效，请检查配置'));
    }

    const errorMessage = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
