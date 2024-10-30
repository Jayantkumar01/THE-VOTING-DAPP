// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }
    
    struct Voter {
        bool hasVoted;
        uint256 votedCandidateId;
    }
    
    address public admin;
    mapping(address => Voter) public voters;
    Candidate[] public candidates;
    bool public votingActive;
    uint256 public votingEnd;
    
    event VoteCast(address indexed voter, uint256 candidateId);
    event CandidateAdded(uint256 id, string name);
    event VotingStarted(uint256 endTime);
    event VotingEnded();
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier votingIsActive() {
        require(votingActive, "Voting is not active");
        require(block.timestamp < votingEnd, "Voting period has ended");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        votingActive = false;
    }
    
    function addCandidate(string memory _name) public onlyAdmin {
        require(!votingActive, "Cannot add candidate while voting is active");
        uint256 candidateId = candidates.length;
        candidates.push(Candidate({
            id: candidateId,
            name: _name,
            voteCount: 0
        }));
        emit CandidateAdded(candidateId, _name);
    }
    
    function startVoting(uint256 _durationInMinutes) public onlyAdmin {
        require(!votingActive, "Voting is already active");
        require(candidates.length > 1, "Need at least 2 candidates");
        votingActive = true;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
        emit VotingStarted(votingEnd);
    }
    
    function endVoting() public onlyAdmin {
        require(votingActive, "Voting is not active");
        votingActive = false;
        emit VotingEnded();
    }
    
    function castVote(uint256 _candidateId) public votingIsActive {
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_candidateId < candidates.length, "Invalid candidate ID");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;
        
        emit VoteCast(msg.sender, _candidateId);
    }
    
    function getCandidatesCount() public view returns (uint256) {
        return candidates.length;
    }
    
    function getCandidate(uint256 _candidateId) public view returns (
        uint256 id,
        string memory name,
        uint256 voteCount
    ) {
        require(_candidateId < candidates.length, "Invalid candidate ID");
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }
    
    function getVoterInfo(address _voter) public view returns (
        bool hasVoted,
        uint256 votedCandidateId
    ) {
        Voter memory voter = voters[_voter];
        return (voter.hasVoted, voter.votedCandidateId);
    }
    
    function getRemainingTime() public view returns (uint256) {
        if (!votingActive || block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
    }
}