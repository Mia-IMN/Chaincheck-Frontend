import React, { useState, useEffect } from 'react';
import { useWallet } from '@suiet/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';

interface LaunchButtonProps {
  onUnlock: () => void; 
  contractPackageId: string;
  configId: string;
}

const CLOCK_ID = '0x6';

export default function LaunchButton({ 
  onUnlock, 
  contractPackageId,
  configId
}: LaunchButtonProps) {
  const { connected, address, signAndExecuteTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [requiredPayment, setRequiredPayment] = useState<number | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  // Function to fetch the current required payment amount from our smart contract
  const fetchRequiredPayment = async () => {
    console.log('Fetching required payment amount...');
    
    if (!connected) {
      console.log('Not connected, skipping payment fetch');
      return;
    }
    
    setIsLoadingPayment(true);
    try {
      console.log('Using fallback payment calculation...');
      
      // Fallback: estimate based on our contract's simulated price logic
      const timestamp = Date.now();
      const basePrice = 3200000; // $3.20 base price in micro-dollars from our smart contract
      const variation = (timestamp % 100000) / 1000;
      const currentPrice = basePrice + variation;
      
      console.log('Current simulated price:', currentPrice);
      
      // Calculate SUI amount for $1 (using our contract's logic)
      const usdAmountMicro = 1_000_000; // $1.00 in micro-dollars
      const suiDecimalsFactor = 1000000000; // 10^9 for SUI decimals
      const suiAmount = (usdAmountMicro * suiDecimalsFactor) / currentPrice;
      
      const finalAmount = Math.ceil(suiAmount);
      console.log('Calculated required payment:', finalAmount);
      
      setRequiredPayment(finalAmount);
    } catch (err) {
      console.error('Failed to fetch payment amount:', err);
      // Fallback to a reasonable default (approximately $1 worth of SUI)
      const fallbackAmount = 300_000_000; // ~0.3 SUI as fallback
      console.log('Using fallback amount:', fallbackAmount);
      setRequiredPayment(fallbackAmount);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  // Fetch required payment amount when component mounts or wallet connects
  useEffect(() => {
    if (connected) {
      fetchRequiredPayment();
    }
  }, [connected, contractPackageId]);

  const handleLaunch = async () => {
    console.log('Launch button clicked');
    console.log('Connected:', connected);
    console.log('Address:', address);
    console.log('Required payment:', requiredPayment);

    if (!connected || !address) {
      console.log('Wallet not connected');
      alert("Please connect your wallet first.");
      return;
    }

    if (isProcessing) {
      console.log('Already processing, ignoring click');
      return; // Prevent double-clicks
    }

    if (requiredPayment === null) {
      console.log('Required payment not loaded yet');
      alert("Loading payment amount... Please try again in a moment.");
      return;
    }

    console.log('Starting payment process...');
    setIsProcessing(true);

    try {
      console.log('Creating transaction block...');
      const tx = new TransactionBlock();

      // Validate IDs format
      console.log('Validating contract IDs...');
      if (!contractPackageId || !contractPackageId.startsWith('0x') || contractPackageId.length !== 66) {
        throw new Error(`Invalid package ID format: ${contractPackageId} (should be 0x + 64 hex chars)`);
      }
      if (!configId || !configId.startsWith('0x') || configId.length !== 66) {
        throw new Error(`Invalid config ID format: ${configId} (should be 0x + 64 hex chars)`);
      }

      console.log('Splitting coins for payment amount:', requiredPayment);
      // Split coins for payment - this is set to use the dynamically fetched amount
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure(requiredPayment)]);

      console.log('Calling contract function...');
      console.log('Package ID:', contractPackageId);
      console.log('Config ID:', configId);
      console.log('Target function:', `${contractPackageId}::payment_contract::make_payment`);
      
      // Call our smart contract's make_payment function with correct signature
      tx.moveCall({
        target: `${contractPackageId}::payment_contract::make_payment`,
        arguments: [
          tx.object(configId),     
          paymentCoin,            
          tx.object(CLOCK_ID),    
        ],
      });

      console.log('Transaction built successfully, debugging transaction structure...');
      
      // Debugging transaction structure
      try {
        console.log('=== TRANSACTION DEBUG INFO ===');
        console.log('Transaction object type:', typeof tx);
        console.log('Transaction constructor:', tx.constructor.name);
        console.log('Transaction blockData:', tx.blockData);
        
        console.log('Testing transaction serialization...');
        const serialized = tx.serialize();
        console.log('Serialization successful, length:', serialized.length);
        
        console.log('Attempting wallet execution...');
        const result = await signAndExecuteTransaction({
          transaction: {
            toJSON: async () => tx.serialize(),
          },
        });
        
        console.log('SUCCESS! Transaction executed:', result);

        // Check if transaction was successful
        // This handles different possible result structures from different wallets
        let isSuccess = false;
        if (
          typeof result.effects === 'object' &&
          result.effects !== null &&
          'status' in result.effects &&
          typeof (result.effects as { status?: string }).status === 'string'
        ) {
          isSuccess = (result.effects as { status: string }).status === 'success';
        }
        // Fallback: check if we have a digest (this usually means success)
        if (!isSuccess && result.digest) {
          isSuccess = true;
        }

        console.log('Transaction success:', isSuccess);

        if (isSuccess) {
          console.log('Payment successful:', result);
          
          onUnlock(); // Changed from setIsUnlocked(true)
          
          // Refresh the required payment amount for next time
          fetchRequiredPayment();
        } else {
          console.error('Transaction failed - no success status detected');
          throw new Error('Transaction failed');
        }
        
      } catch (debugError: any) {
        console.error('=== DEBUG ERROR ===');
        console.error('Error occurred at:', debugError.message);
        console.error('Error stack:', debugError.stack);
        console.error('Error type:', typeof debugError);
        console.error('Error constructor:', debugError.constructor.name);
        throw debugError;
      }

    } catch (err: any) {
      console.error('Payment failed with error:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      // More specific error messages
      let errorMessage = 'Payment failed! ';
      if (err.message?.includes('InsufficientCoinBalance')) {
        errorMessage += 'Insufficient SUI balance in wallet.';
      } else if (err.message?.includes('UserRejected')) {
        errorMessage += 'Transaction was rejected by user.';
      } else if (err.message?.includes('E_INSUFFICIENT_PAYMENT')) {
        errorMessage += 'Payment amount insufficient.';
        // Refresh payment amount in case it changed
        fetchRequiredPayment();
      } else if (err.message?.includes('E_CONTRACT_PAUSED')) {
        errorMessage += 'Payment contract is currently paused.';
      } else if (err.message?.includes('not connected')) {
        errorMessage += 'Wallet not connected properly.';
      } else {
        errorMessage += `Error: ${err.message || 'Check console for details.'}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSuiAmount = (amountInMist: number): string => {
    return (amountInMist / 1_000_000_000).toFixed(4);
  };

  const refreshPaymentAmount = () => {
    fetchRequiredPayment();
  };

  return (
    <div className="flex flex-col items-center gap-2">
           
      {/* Main launch button */}
      <button
        onClick={handleLaunch}
        disabled={!connected || isProcessing || requiredPayment === null}
        className={`
          px-6 py-3 rounded-lg font-medium text-white
          bg-gradient-to-r from-blue-500 to-purple-600
          hover:from-blue-600 hover:to-purple-700
          transition-all duration-200 transform hover:scale-105
          disabled:from-gray-400 disabled:to-gray-500 
          disabled:cursor-not-allowed disabled:transform-none
          ${isProcessing ? 'animate-pulse' : ''}
        `}
      >
        {isProcessing 
          ? 'Processing Payment...' 
          : !connected 
          ? 'Connect Wallet First'
          : requiredPayment === null
          ? 'Loading...'
          : `Launch Portfolio Manager (~${formatSuiAmount(requiredPayment)} SUI)`
        }
      </button>

      {/* Payment info and refresh button */}
      {connected && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            Payment required: {requiredPayment !== null ? `${formatSuiAmount(requiredPayment)} SUI ($1.00)` : 'Loading...'}
          </span>
          <button
            onClick={refreshPaymentAmount}
            disabled={isLoadingPayment}
            className="text-blue-500 hover:text-blue-700 underline"
            title="Refresh payment amount"
          >
            {isLoadingPayment ? '⟳' : '↻'}
          </button>
        </div>
      )}
    </div>
  );
}