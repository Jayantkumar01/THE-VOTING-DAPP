import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contractAddress';
import AdminControls from './AdminControls';
import CandidateList from './CandidateList';
import WalletInfo from './WalletInfo';

const VotingDApp = () => {
  // State management
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Effect to initialize the connection
  useEffect(() => {
    initializeEthers();
    return () => {
      // Cleanup listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
      }
    };
  }, []);

  // Effect for contract initialization
  useEffect(() => {
    if (signer && !contract) {
      initializeContract();
    }
  }, [signer]);

  // Effect to load contract data
  useEffect(() => {
    if (contract && account) {
      loadContractData();
    }
  }, [contract, account]);

  // Effect to update remaining time periodically
  useEffect(() => {
    let timer;
    if (contract) {
      timer = setInterval(() => {
        updateRemainingTime();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [contract]);

  // Initialize ethers and setup provider
  const initializeEthers = async () => {
    try {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        
        // Setup account change listener
        window.ethereum.on('accountsChanged', handleAccountChange);
        
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        setAccount(accounts[0]);
      } else {
        alert('Please install MetaMask!');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing ethers:', error);
      setLoading(false);
    }
  };

  // Initialize contract
  const initializeContract = async () => {
    try {
      if (!CONTRACT_ADDRESS || !CONTRACT_ABI) {
        throw new Error('Contract address or ABI not configured');
      }
      
      const votingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(votingContract);
    } catch (error) {
      console.error('Error initializing contract:', error);
      alert('Error initializing contract. Please check console for details.');
      setLoading(false);
    }
  };

  // Load all contract data
  const loadContractData = async () => {
    try {
      await Promise.all([
        checkIfAdmin(),
        loadCandidates(),
        updateRemainingTime()
      ]);
    } catch (error) {
      console.error('Error loading contract data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle account changes
  const handleAccountChange = async (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      if (contract) {
        await checkIfAdmin();
      }
    } else {
      setAccount('');
      setIsAdmin(false);
    }
  };

  // Check if connected account is admin
  const checkIfAdmin = async () => {
    try {
      if (!contract || !account) return;
      const adminAddress = await contract.admin();
      setIsAdmin(account.toLowerCase() === adminAddress.toLowerCase());
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  // Load candidates from contract
  const loadCandidates = async () => {
    try {
      if (!contract) return;
      const count = await contract.getCandidatesCount();
      const candidatesList = [];
      
      for (let i = 0; i < count.toNumber(); i++) {
        const candidate = await contract.getCandidate(i);
        candidatesList.push({
          id: candidate[0].toNumber(),
          name: candidate[1],
          voteCount: candidate[2].toNumber()
        });
      }
      
      setCandidates(candidatesList);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
    }
  };

  // Update remaining voting time
  const updateRemainingTime = async () => {
    try {
      if (!contract) return;
      const time = await contract.getRemainingTime();
      setRemainingTime(time.toNumber());
    } catch (error) {
      console.error('Error updating remaining time:', error);
      setRemainingTime(0);
    }
  };

  // Handle vote casting
  const handleVote = async (candidateId) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.castVote(candidateId);
      await tx.wait();
      await loadCandidates();
      alert('Vote cast successfully!');
    } catch (error) {
      console.error('Error casting vote:', error);
      alert(error.message || 'Error casting vote. Please check console for details.');
    }
  };

  // Handle candidate addition
  const handleCandidateAdded = async () => {
    await loadCandidates();
  };

  // Handle voting started
  const handleVotingStarted = async () => {
    await updateRemainingTime();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WalletInfo 
        account={account}
        remainingTime={remainingTime}
      />

      {isAdmin && contract && (
        <AdminControls
          contract={contract}
          onCandidateAdded={handleCandidateAdded}
          onVotingStarted={handleVotingStarted}
        />
      )}

      <CandidateList
        candidates={candidates}
        onVote={handleVote}
      />
    </div>
  );
};

export default VotingDApp;