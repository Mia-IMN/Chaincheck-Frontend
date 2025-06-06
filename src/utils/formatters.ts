import { Token } from '../types';

// Price formatting utility
export const formatPrice = (price: number): string => {
  if (typeof price !== 'number' || isNaN(price)) return '$0.00';
  
  if (price < 0.000001) {
    return `$${price.toExponential(2)}`;
  } else if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
};

// Market cap formatting utility
export const formatMarketCap = (marketCap: number): string => {
  if (typeof marketCap !== 'number' || isNaN(marketCap)) return '$0';
  
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  } else {
    return `$${marketCap.toFixed(2)}`;
  }
};

// Volume formatting utility (same as market cap)
export const formatVolume = (volume: number): string => {
  return formatMarketCap(volume);
};

// Supply formatting utility
export const formatSupply = (supply: number): string => {
  if (typeof supply !== 'number' || isNaN(supply)) return '0';
  
  if (supply >= 1e12) {
    return `${(supply / 1e12).toFixed(2)}T`;
  } else if (supply >= 1e9) {
    return `${(supply / 1e9).toFixed(2)}B`;
  } else if (supply >= 1e6) {
    return `${(supply / 1e6).toFixed(2)}M`;
  } else if (supply >= 1e3) {
    return `${(supply / 1e3).toFixed(2)}K`;
  } else {
    return supply.toFixed(0);
  }
};

// Address formatting utility
export const truncateAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

// FIXED: Unified risk score calculation with consistent parameter names
export const getRiskScore = (priceChange24h: number, marketCap: number): 'low' | 'medium' | 'high' => {
  console.log(`Calculating risk score: priceChange=${priceChange24h}, marketCap=${marketCap}`);
  
  // Handle invalid inputs
  if (typeof priceChange24h !== 'number' || typeof marketCap !== 'number') {
    console.warn('Invalid inputs for risk score calculation');
    return 'medium';
  }
  
  // High risk conditions
  if (priceChange24h < -20 || marketCap < 1000000) { // Less than $1M market cap or >20% drop
    console.log('Risk Score: HIGH');
    return 'high';
  }
  
  // Low risk conditions  
  if (priceChange24h > -5 && marketCap > 1000000000) { // Less than 5% drop and >$1B market cap
    console.log('Risk Score: LOW');
    return 'low';
  }
  
  // Medium risk (everything else)
  console.log('Risk Score: MEDIUM');
  return 'medium';
};

// Alternative risk score function for backwards compatibility
export const getRiskScoreAlt = (priceChange: number, marketCap: number): 'low' | 'medium' | 'high' => {
  if (marketCap > 1e9 && Math.abs(priceChange) < 10) return 'low';
  if (marketCap > 1e8 && Math.abs(priceChange) < 20) return 'medium';
  return 'high';
};

// FIXED: Unified token category detection
export const getTokenCategory = (name: string, symbol: string): 'DeFi' | 'Gaming' | 'Infrastructure' | 'NFT' | 'Other' => {
  const lowerName = name.toLowerCase();
  const lowerSymbol = symbol.toLowerCase();
  
  // DeFi tokens
  if (lowerName.includes('dex') || lowerName.includes('swap') || lowerName.includes('cetus') || 
      lowerName.includes('turbos') || lowerName.includes('finance') || lowerSymbol.includes('cetus') ||
      lowerName.includes('defi') || lowerName.includes('liquidity')) {
    return 'DeFi';
  }
  
  // Gaming tokens
  if (lowerName.includes('game') || lowerName.includes('gaming') || lowerName.includes('metaverse') ||
      lowerName.includes('play')) {
    return 'Gaming';
  }
  
  // Infrastructure tokens
  if (lowerName.includes('sui') || lowerSymbol === 'sui' || lowerName.includes('node') || 
      lowerName.includes('validator') || lowerName.includes('bridge') || lowerName.includes('oracle')) {
    return 'Infrastructure';
  }
  
  // NFT tokens
  if (lowerName.includes('nft') || lowerName.includes('collectible')) {
    return 'NFT';
  }
  
  return 'Other';
};

// FIXED: Unified risk badge styling (using amber for medium to match your existing design)
export const getRiskBadge = (riskScore: 'low' | 'medium' | 'high'): string => {
  switch (riskScore) {
    case 'low':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'high':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

// Alternative risk badge function for backwards compatibility
export const getRiskLevelBadge = (riskLevel: 'low' | 'medium' | 'high'): string => {
  return getRiskBadge(riskLevel);
};

// Risk color utilities
export const getRiskColor = (risk: Token['riskScore']): string => {
  switch(risk) {
    case 'low': return 'text-emerald-400';
    case 'medium': return 'text-amber-400';
    case 'high': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

// Status utilities for analysis results
export const getStatusColor = (status: 'safe' | 'warning' | 'risk'): string => {
  switch(status) {
    case 'safe': return 'text-emerald-400';
    case 'warning': return 'text-amber-400';
    case 'risk': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const getStatusBadge = (status: 'safe' | 'warning' | 'risk'): string => {
  switch(status) {
    case 'safe': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'risk': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

// Category styling utility
export const getCategoryStyle = (category: string, isDark: boolean): string => {
  switch(category) {
    case 'Security': 
      return isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200';
    case 'Infrastructure': 
      return isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200';
    case 'Analytics': 
      return isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200';
    case 'Risk Management': 
      return isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200';
    case 'Research': 
      return isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'DeFi':
      return isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200';
    case 'Gaming':
      return isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200';
    case 'NFT':
      return isDark ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-pink-50 text-pink-600 border-pink-200';
    default: 
      return isDark ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

// Debugging utility
export const debugToken = (token: any) => {
  console.log('=== TOKEN DEBUG ===');
  console.log('Token object:', token);
  console.log('Has riskScore:', !!token.riskScore);
  console.log('Risk score value:', token.riskScore);
  console.log('Risk badge CSS:', token.riskScore ? getRiskBadge(token.riskScore) : 'no risk score');
  console.log('Token category:', getTokenCategory(token.name || '', token.symbol || ''));
  console.log('==================');
};

// Validation utilities
export const validateTokenData = (token: Partial<Token>): boolean => {
  if (!token.name || !token.symbol) {
    console.error('Token missing required fields:', token);
    return false;
  }
  return true;
};

// Price change utilities
export const formatPriceChange = (change: number): string => {
  if (typeof change !== 'number' || isNaN(change)) return '0.00%';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

// Market data utilities
export const calculateMarketDominance = (tokenMarketCap: number, totalMarketCap: number): string => {
  if (!tokenMarketCap || !totalMarketCap || totalMarketCap === 0) return '0.00%';
  const dominance = (tokenMarketCap / totalMarketCap) * 100;
  return `${dominance.toFixed(2)}%`;
};