'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Wallet, DollarSign, TrendingUp } from 'lucide-react';

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}

interface UserPosition {
  totalCollateral: string;
  totalBorrowed: string;
  healthFactor: string;
  isActive: boolean;
}

export default function Home() {
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [amount, setAmount] = useState('');
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserPosition = useCallback(async (userAddress: string) => {
    try {
      // Demo data - replace with actual contract calls later
      const demoPosition: UserPosition = {
        totalCollateral: '0.00',
        totalBorrowed: '0.00',
        healthFactor: '999',
        isActive: false
      };
      setUserPosition(demoPosition);
      console.log('Fetched position for:', userAddress);
    } catch (error) {
      console.error('Error fetching position:', error);
    }
  }, []);

  const checkWalletConnection = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        }) as string[];
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await fetchUserPosition(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  }, [fetchUserPosition]);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount('');
      setIsConnected(false);
      setUserPosition(null);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
      fetchUserPosition(accounts[0]);
    }
  }, [fetchUserPosition]);

  useEffect(() => {
    checkWalletConnection();
    
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [checkWalletConnection, handleAccountsChanged]);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask browser extension!');
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];
      
      setAccount(accounts[0]);
      setIsConnected(true);
      await fetchUserPosition(accounts[0]);
      alert('Wallet connected successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || !isConnected) return;
    
    setLoading(true);
    try {
      // Demo mode - replace with actual contract interaction later
      alert(`Demo: Would deposit ${amount} ETH to smart contract`);
      
      // Update position (demo)
      const updatedPosition: UserPosition = {
        totalCollateral: amount,
        totalBorrowed: '0.00',
        healthFactor: '999',
        isActive: true
      };
      setUserPosition(updatedPosition);
      setAmount('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Deposit failed:', error);
      alert('Deposit failed: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <CreditCard className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">OmniLend</h1>
          </div>
          
          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            Cross-Chain Lending
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {' '}Platform
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Deposit ETH and experience cross-chain lending powered by smart contracts
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <TrendingUp className="h-10 w-10 text-green-400 mb-3" />
            <h3 className="text-lg font-bold mb-2">Smart Contracts</h3>
            <p className="text-gray-300 text-sm">Your funds are secured by audited smart contracts on the blockchain.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <Wallet className="h-10 w-10 text-purple-400 mb-3" />
            <h3 className="text-lg font-bold mb-2">Cross-Chain Ready</h3>
            <p className="text-gray-300 text-sm">Designed to work across multiple blockchain networks seamlessly.</p>
          </div>
        </div>

        {isConnected ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* User Position */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <DollarSign className="mr-2" />
                Your Position
              </h3>
              
              {userPosition ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Collateral:</span>
                    <span className="font-semibold text-green-400">${userPosition.totalCollateral}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Borrowed:</span>
                    <span className="font-semibold">${userPosition.totalBorrowed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Health Factor:</span>
                    <span className="font-semibold text-green-400">
                      {(parseInt(userPosition.healthFactor) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className={`font-semibold ${userPosition.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                      {userPosition.isActive ? 'Active' : 'Connected'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300">Loading position...</p>
              )}
            </div>

            {/* Deposit Form */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Deposit ETH Collateral</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Amount (ETH)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.1"
                    step="0.01"
                  />
                </div>
                
                <button
                  onClick={handleDeposit}
                  disabled={loading || !amount}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Deposit ETH (Demo)'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
            <p className="text-gray-300 mb-6">Connect MetaMask to start using OmniLend</p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
