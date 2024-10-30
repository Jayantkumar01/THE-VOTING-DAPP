import React, { useState } from 'react';

const AdminControls = ({ contract, onCandidateAdded, onVotingStarted }) => {
  const [newCandidateName, setNewCandidateName] = useState('');
  const [votingDuration, setVotingDuration] = useState('');

  const addCandidate = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.addCandidate(newCandidateName);
      await tx.wait();
      onCandidateAdded();
      setNewCandidateName('');
    } catch (error) {
      console.error('Error adding candidate:', error);
      alert('Error adding candidate. Check console for details.');
    }
  };

  const startVoting = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.startVoting(parseInt(votingDuration));
      await tx.wait();
      onVotingStarted();
      setVotingDuration('');
    } catch (error) {
      console.error('Error starting voting:', error);
      alert('Error starting voting. Check console for details.');
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Admin Controls</h2>
      <form onSubmit={addCandidate} className="mb-4">
        <input
          type="text"
          value={newCandidateName}
          onChange={(e) => setNewCandidateName(e.target.value)}
          placeholder="Enter candidate name"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Candidate
        </button>
      </form>

      <form onSubmit={startVoting}>
        <input
          type="number"
          value={votingDuration}
          onChange={(e) => setVotingDuration(e.target.value)}
          placeholder="Enter voting duration (minutes)"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Start Voting
        </button>
      </form>
    </div>
  );
};

export default AdminControls;