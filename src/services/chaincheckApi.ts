import axios from 'axios';

// Use the correct backend URL from environment or fallback to backend port
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TokenAnalysis {
  contractAddress: string;
  overallScore: number;
  contractBehavior: {
    contractVerificationScore: number;
    honeypotScore: number;
    mintAuthorityScore: number;
    ownerPrivilegesScore: number;
    hiddenFunctionsScore: number;
    totalScore: number;
    details: any;
  };
  liquidityHealth: {
    poolLockedScore: number;
    liquidityDepthScore: number;
    deployerControlScore: number;
    poolAgeScore: number;
    totalScore: number;
    details: any;
  };
  holderDistribution: {
    topHolderScore: number;
    whaleDetectionScore: number;
    deployerActivityScore: number;
    diversityScore: number;
    totalScore: number;
    details: any;
  };
  communitySignals: {
    socialPresenceScore: number;
    engagementScore: number;
    chainActivityScore: number;
    marketMentionScore: number;
    totalScore: number;
    details: any;
  };
  liquidityInfo: {
    price: number | string;
    volume24h: number | string;
    liquidity: number | string;
    priceChange24h: number | string;
    marketCap: number | string;
  };
}

export const chaincheckApi = {
  analyzeToken: async (contractAddress: string): Promise<TokenAnalysis> => {
    // Use GET method and pass contract address in URL path
    const response = await apiClient.get(`/analyze/${contractAddress}`);
    return response.data;
  },
  
  getTokenLiquidity: async (contractAddress: string) => {
    const response = await apiClient.get(`/liquidity/${contractAddress}`);
    return response.data;
  },
};