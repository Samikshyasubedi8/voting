import hashlib
import json
import time
from typing import Dict, List
from django.utils import timezone as django_timezone

class Block:
    def __init__(self, index: int, vote_data: Dict, previous_hash: str = None, db_block=None):
        if db_block:
            # Load from database
            self.index = db_block.index
            self.timestamp = db_block.timestamp.timestamp()
            self.vote_data = db_block.vote_data
            self.previous_hash = db_block.previous_hash
            self.nonce = db_block.nonce
            self.hash = db_block.hash
        else:
            # Create new block
            self.index = index
            self.timestamp = time.time()
            self.vote_data = vote_data
            self.previous_hash = previous_hash if previous_hash else "0"
            self.nonce = 0
            self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        block_string = f"{self.index}{self.timestamp}{self.vote_data}{self.previous_hash}{self.nonce}"
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty: int = 4) -> str:
        target = '0' * difficulty
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
        print(f"Block {self.index} mined! Nonce: {self.nonce}, Hash: {self.hash[:16]}...")
        return self.hash


class Blockchain:
    def __init__(self):
        self.chain = []
        self.difficulty = 4
        self.load_from_database()
    
    def load_from_database(self):
        """Load existing blockchain from database"""
        from voting.models import BlockchainBlock
        
        blocks_from_db = BlockchainBlock.objects.all().order_by('index')
        
        if blocks_from_db.exists():
            for db_block in blocks_from_db:
                block = Block(
                    index=db_block.index,
                    vote_data=db_block.vote_data,
                    previous_hash=db_block.previous_hash,
                    db_block=db_block
                )
                block.timestamp = db_block.timestamp.timestamp()
                block.nonce = db_block.nonce
                block.hash = db_block.hash
                self.chain.append(block)
            print(f"✅ Loaded {len(self.chain)} blocks from database")
        else:
            self.create_genesis_block()
    
    def create_genesis_block(self):
        """Create genesis block and save to database"""
        from voting.models import BlockchainBlock
        
        genesis_vote = {'message': 'Genesis Block - Voting System Started'}
        genesis_block = Block(0, genesis_vote, "0")
        genesis_block.mine_block(self.difficulty)
        
        # Save to database
        BlockchainBlock.objects.create(
            index=genesis_block.index,
            timestamp=django_timezone.now(),
            vote_data=genesis_block.vote_data,
            previous_hash=genesis_block.previous_hash,
            hash=genesis_block.hash,
            nonce=genesis_block.nonce,
            verified=True
        )
        self.chain.append(genesis_block)
        print("✅ Genesis block created and saved to database!")
    
    def get_latest_block(self):
        return self.chain[-1]
    
    def add_vote(self, vote_data: Dict):
        """Add a vote block and save to database"""
        from voting.models import BlockchainBlock
        
        new_block = Block(
            index=len(self.chain),
            vote_data=vote_data,
            previous_hash=self.get_latest_block().hash
        )
        
        new_block.mine_block(self.difficulty)
        
        # Save to database
        BlockchainBlock.objects.create(
            index=new_block.index,
            timestamp=django_timezone.now(),
            vote_data=new_block.vote_data,
            previous_hash=new_block.previous_hash,
            hash=new_block.hash,
            nonce=new_block.nonce,
            verified=True
        )
        
        self.chain.append(new_block)
        print(f"✅ Vote block {new_block.index} saved to database!")
        return new_block
    
    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]
            
            if current.hash != current.calculate_hash():
                return False
            if current.previous_hash != previous.hash:
                return False
            if current.hash[:self.difficulty] != '0' * self.difficulty:
                return False
        return True


# Singleton instance
_blockchain_instance = None

def get_blockchain():
    global _blockchain_instance
    if _blockchain_instance is None:
        _blockchain_instance = Blockchain()
    return _blockchain_instance