// src/components/AnalysisResultsPopup.tsx

import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Shield, Activity, Clock, Code, Droplets, Users, Network, Brain, CheckCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Token } from '../types';
import { TokenAnalysis } from '../services/chaincheckApi';
import { Tooltip } from './ui/Tooltip';
import { truncateAddress } from '../utils/formatters';

interface AnalysisResultsPopupProps {
  token: Token | null;
  analysis: TokenAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const AnalysisResultsPopup: React.FC<AnalysisResultsPopupProps> = ({ 
  token, 
  analysis, 
  isOpen, 
  onClose, 
  isDark 
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    contractBehavior: false,
    liquidityHealth: false,
    communitySignals: false,
    holderDistribution: false
  });

  const [addressCopied, setAddressCopied] = useState(false);

  if (!isOpen || !token || !analysis) return null;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyAddress = async () => {
    if (token.contractAddress) {
      try {
        await navigator.clipboard.writeText(token.contractAddress);
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  // Helper function to get status color
  const getStatusColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  // Helper function to get performance label
  const getPerformanceLabel = (score: number): string => {
    if (score >= 90) return 'Excellent Performance';
    if (score >= 80) return 'Good Performance';
    if (score >= 60) return 'Average Performance';
    return 'Poor Performance';
  };

  // Helper function to get risk level
  const getRiskLevel = (score: number): string => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    return 'High Risk';
  };

  // Extract scores from analysis
  const overallScore = Math.round(analysis.overallScore);
  const contractScore = Math.round(analysis.contractBehavior.totalScore);
  const liquidityScore = Math.round(analysis.liquidityHealth.totalScore);
  const holderScore = Math.round(analysis.holderDistribution.totalScore);
  const communityScore = Math.round(analysis.communitySignals.totalScore);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-8 px-8 pb-24 text-center sm:block sm:p-8">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className={`inline-block align-bottom rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-12 sm:align-middle sm:max-w-7xl sm:w-full mx-4 sm:mx-8 ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'
        }`}>
          {/* Header */}
          <div className={`px-4 sm:px-8 py-6 border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {token.image ? (
                  <img src={token.image} alt={token.symbol} className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex-shrink-0" />
                ) : (
                  <div className={`w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0
                    ${token.symbol === 'SUI' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      token.symbol === 'CETUS' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                      token.symbol === 'TURBOS' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                      token.symbol === 'DEEP' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                      'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                    {token.symbol.slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className={`text-lg sm:text-2xl lg:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {token.contractAddress ? 
                      `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` : 
                      `${token.symbol} Analysis`
                    }
                  </h2>
                  {token.contractAddress && (
                    <div className="hidden lg:block mt-1">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {token.contractAddress}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                    <span className={`text-sm sm:text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {token.symbol}
                    </span>
                    {token.contractAddress && (
                      <div className="flex items-center gap-1">
                        <span className={`text-xs sm:text-sm font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {window.innerWidth < 640 ? 
                            `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` :
                            truncateAddress(token.contractAddress)
                          }
                        </span>
                        <button
                          onClick={copyAddress}
                          className={`p-1 rounded hover:bg-opacity-20 ${isDark ? 'hover:bg-white' : 'hover:bg-black'} transition-colors`}
                          title="Copy address"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {addressCopied && (
                          <span className="text-xs text-emerald-400">Copied!</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${getStatusColor(overallScore)}`}>
                    {overallScore}
                  </div>
                  <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Trust Score
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 sm:p-3 rounded-xl transition-colors ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="p-6 sm:p-10">
              
              {/* Success Indicator */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-emerald-500/20 mb-4">
                  <CheckCircle className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-400" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ✅ REAL ANALYSIS COMPLETED!
                </h3>
                <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  🏷️ Token: {token.name} ({token.symbol})
                </p>
              </div>

              {/* Score Summary */}
              <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl border ${
                isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-lg sm:text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  📊 Analysis Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold ${getStatusColor(overallScore)}`}>
                      {overallScore}
                    </div>
                    <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      📊 Overall
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold ${getStatusColor(contractScore)}`}>
                      {contractScore}
                    </div>
                    <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      🔒 Security
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold ${getStatusColor(liquidityScore)}`}>
                      {liquidityScore}
                    </div>
                    <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      💧 Liquidity
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold ${getStatusColor(holderScore)}`}>
                      {holderScore}
                    </div>
                    <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      👥 Holders
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold ${getStatusColor(communityScore)}`}>
                      {communityScore}
                    </div>
                    <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      🌐 Community
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Smart Contract Behavior Card */}
                <div className={`rounded-2xl border p-4 sm:p-6 ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Shield className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          🔒 Contract Security
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSection('contractBehavior')}
                      className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedSections.contractBehavior ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-2xl sm:text-3xl font-bold ${getStatusColor(contractScore)}`}>
                        {contractScore}
                      </span>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {getPerformanceLabel(contractScore)}
                    </div>
                  </div>

                  {expandedSections.contractBehavior && (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Security Metrics
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Contract Verification
                            </span>
                            <span className="text-xs font-medium text-emerald-400">
                              {Math.round(analysis.contractBehavior.contractVerificationScore)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Honeypot Detection
                            </span>
                            <span className="text-xs font-medium text-emerald-400">
                              {Math.round(analysis.contractBehavior.honeypotScore)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Mint Authority
                            </span>
                            <span className="text-xs font-medium text-emerald-400">
                              {Math.round(analysis.contractBehavior.mintAuthorityScore)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Owner Privileges
                            </span>
                            <span className="text-xs font-medium text-emerald-400">
                              {Math.round(analysis.contractBehavior.ownerPrivilegesScore)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Security Analysis
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Key Insights
                            </span>
                            <div className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                              Contract security analysis shows {contractScore >= 80 ? 'strong' : contractScore >= 60 ? 'moderate' : 'weak'} security indicators. 
                              {contractScore >= 80 ? ' No critical vulnerabilities detected.' : contractScore >= 60 ? ' Some risks identified, proceed with caution.' : ' Multiple security concerns detected.'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Liquidity Health Card */}
                <div className={`rounded-2xl border p-4 sm:p-6 ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Droplets className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          💧 Liquidity Health
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSection('liquidityHealth')}
                      className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedSections.liquidityHealth ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-2xl sm:text-3xl font-bold ${getStatusColor(liquidityScore)}`}>
                        {liquidityScore}
                      </span>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {liquidityScore >= 80 ? 'Strong Liquidity' : liquidityScore >= 60 ? 'Moderate Liquidity' : 'Weak Liquidity'}
                    </div>
                  </div>

                  {expandedSections.liquidityHealth && (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Liquidity Analysis
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Pool Locked Score
                            </span>
                            <span className="text-xs font-medium text-blue-400">
                              {Math.round(analysis.liquidityHealth.poolLockedScore)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Liquidity Depth
                            </span>
                            <span className="text-xs font-medium text-blue-400">
                              {Math.round(analysis.liquidityHealth.liquidityDepthScore)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Deployer Control
                            </span>
                            <span className="text-xs font-medium text-blue-400">
                              {Math.round(analysis.liquidityHealth.deployerControlScore)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Liquidity Insights
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Assessment
                            </span>
                            <div className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                              Liquidity analysis shows {liquidityScore >= 80 ? 'excellent' : liquidityScore >= 60 ? 'adequate' : 'concerning'} depth and stability. 
                              {liquidityScore >= 60 ? ' Trading should be possible without significant slippage.' : ' High slippage risk for larger trades.'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Holder Distribution Card */}
                <div className={`rounded-2xl border p-4 sm:p-6 ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          👥 Holder Distribution
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSection('holderDistribution')}
                      className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedSections.holderDistribution ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-2xl sm:text-3xl font-bold ${getStatusColor(holderScore)}`}>
                        {holderScore}
                      </span>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {holderScore >= 80 ? 'Healthy Distribution' : holderScore >= 60 ? 'Moderate Distribution' : 'Concentrated Holdings'}
                    </div>
                  </div>

                  {expandedSections.holderDistribution && (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Distribution Metrics
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Top Holder Score
                            </span>
                            <span className="text-xs font-medium text-purple-400">
                              {Math.round(analysis.holderDistribution.topHolderScore)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Whale Detection
                            </span>
                            <span className="text-xs font-medium text-purple-400">
                              {Math.round(analysis.holderDistribution.whaleDetectionScore)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Diversity Score
                            </span>
                            <span className="text-xs font-medium text-purple-400">
                              {Math.round(analysis.holderDistribution.diversityScore)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Holder Analysis
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Distribution Health
                            </span>
                            <div className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                              Holder distribution shows {holderScore >= 80 ? 'excellent' : holderScore >= 60 ? 'good' : 'concerning'} decentralization. 
                              {holderScore >= 60 ? ' No single entity controls significant portions.' : ' High concentration risk detected.'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Community Signals Card */}
                <div className={`rounded-2xl border p-4 sm:p-6 ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Network className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          🌐 Community Signals
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSection('communitySignals')}
                      className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedSections.communitySignals ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-2xl sm:text-3xl font-bold ${getStatusColor(communityScore)}`}>
                        {communityScore}
                      </span>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {communityScore >= 80 ? 'High Engagement' : communityScore >= 60 ? 'Moderate Engagement' : 'Low Engagement'}
                    </div>
                  </div>

                  {expandedSections.communitySignals && (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Community Metrics
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Social Presence
                            </span>
                            <span className="text-xs font-medium text-orange-400">
                              {Math.round(analysis.communitySignals.socialPresenceScore)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Engagement Score
                            </span>
                            <span className="text-xs font-medium text-orange-400">
                              {Math.round(analysis.communitySignals.engagementScore)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Chain Activity
                            </span>
                            <span className="text-xs font-medium text-orange-400">
                              {Math.round(analysis.communitySignals.chainActivityScore)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Community Health
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Engagement Analysis
                            </span>
                            <div className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                              Community signals show {communityScore >= 80 ? 'strong' : communityScore >= 60 ? 'moderate' : 'weak'} engagement levels. 
                              {communityScore >= 60 ? ' Active community with positive sentiment.' : ' Limited community presence detected.'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={onClose}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-colors ${
                    isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Close Analysis
                </button>
                <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] transition-all duration-200">
                  Export Detailed Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};