import React from 'react';

const WalletInfo = ({ account, remainingTime }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-4">Voting DApp</h1>
      <p className="mb-2">Connected Account: {account}</p>
      <p className="mb-4">Remaining Time: {remainingTime} seconds</p>
    </div>
  );
};

export default WalletInfo;