from datetime import datetime
from typing import List, Dict, Any, Optional
from .custom_sha256 import VotingHasher


class SimpleBlock:
    """A single block in the voting blockchain using custom SHA-256"""
    
    def __init__(self, index: int, votes: List[Dict], previous_hash: str, timestamp: str = None):
        self.index = index
        self.votes = votes
        self.timestamp = timestamp or datetime.now().isoformat()
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calculate hash using custom SHA-256"""
        vote_data = str(self.votes)
        return VotingHasher.hash_block(
            self.index, 
            self.timestamp, 
            vote_data, 
            self.previous_hash
        )
    
    def mine_block(self, difficulty: int = 2):
        """Proof-of-Work mining"""
        target = '0' * difficulty
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
    
    def to_dict(self) -> Dict:
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'votes': self.votes,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
            'hash': self.hash
        }


class VotingBlockchain:
    """Blockchain for voting using custom SHA-256"""
    
    def __init__(self, difficulty: int = 2):
        self.chain: List[SimpleBlock] = []
        self.pending_votes: List[Dict] = []
        self.difficulty = difficulty
        self.votes_per_block = 10
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """Create genesis block"""
        genesis = SimpleBlock(0, [], "0")
        genesis.mine_block(self.difficulty)
        self.chain.append(genesis)
    
    def get_latest_block(self) -> SimpleBlock:
        """Get last block in chain"""
        return self.chain[-1]
    
    def add_vote(self, voter_id: str, candidate_id: int, 
                 candidate_name: str, timestamp: str) -> Optional[SimpleBlock]:
        """Add vote and create block if threshold reached"""
        vote_hash = VotingHasher.hash_vote(voter_id, candidate_id, timestamp)
        voter_hash = VotingHasher.hash_voter_id(voter_id)
        
        vote_record = {
            'voter_id': voter_id,
            'voter_hash': voter_hash,
            'candidate_id': candidate_id,
            'candidate_name': candidate_name,
            'vote_hash': vote_hash,
            'timestamp': timestamp
        }
        self.pending_votes.append(vote_record)
        
        if len(self.pending_votes) >= self.votes_per_block:
            return self.create_block()
        return None
    
    def create_block(self) -> Optional[SimpleBlock]:
        """Create new block with pending votes"""
        if not self.pending_votes:
            return None
        
        previous_block = self.get_latest_block()
        new_block = SimpleBlock(
            index=len(self.chain),
            votes=self.pending_votes.copy(),
            previous_hash=previous_block.hash
        )
        
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)
        self.pending_votes = []
        
        return new_block
    
    def is_chain_valid(self) -> bool:
        """Verify blockchain integrity"""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]
            
            if current.hash != current.calculate_hash():
                return False
            if current.previous_hash != previous.hash:
                return False
        
        return True
    
    def verify_vote(self, vote_hash: str) -> bool:
        """Check if vote exists in blockchain"""
        for block in self.chain:
            for vote in block.votes:
                if vote['vote_hash'] == vote_hash:
                    return True
        return False
    
    def get_votes_by_candidate(self, candidate_id: int) -> List[Dict]:
        """Get all votes for a candidate"""
        votes = []
        for block in self.chain:
            for vote in block.votes:
                if vote['candidate_id'] == candidate_id:
                    votes.append(vote)
        return votes
    
    def get_all_blocks(self) -> List[Dict]:
        """Get all blocks"""
        return [block.to_dict() for block in self.chain]
    
    def get_vote_count(self) -> int:
        """Total votes in blockchain"""
        total = 0
        for block in self.chain:
            total += len(block.votes)
        return total
    
    def get_stats(self) -> Dict:
        """Get blockchain statistics"""
        return {
            'total_blocks': len(self.chain),
            'total_votes': self.get_vote_count(),
            'pending_votes': len(self.pending_votes),
            'chain_valid': self.is_chain_valid(),
            'latest_block_hash': self.get_latest_block().hash
        }



voting_blockchain = VotingBlockchain(difficulty=2)