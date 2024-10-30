import React from 'react';

const CandidateList = ({ candidates, onVote }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Candidates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="border p-4 rounded">
            <h3 className="font-bold mb-2">{candidate.name}</h3>
            <p className="mb-2">Votes: {candidate.voteCount}</p>
            <button
              onClick={() => onVote(candidate.id)}
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateList;