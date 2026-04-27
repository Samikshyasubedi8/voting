from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import BlockchainBlock, Candidate, Voter
from .custom_sha256 import VotingHasher
from datetime import datetime
from .blockchain import get_blockchain

class VoteWithCustomHashView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        voter = request.user
        candidate_id = request.data.get('candidate_id')
        
        # Check if already voted using blockchain
        voter_hash = VotingHasher.hash_voter_id(voter.voter_id)
        blockchain = get_blockchain()
        
        for block in blockchain.chain:
            if block.index > 0 and block.vote_data.get('voter_hash') == voter_hash:
                return Response({'error': 'You have already voted'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            candidate = Candidate.objects.get(id=candidate_id)
            
            # Create vote data for blockchain
            vote_data = {
                'voter_hash': voter_hash,
                'candidate_id': candidate.id,
                'candidate_name': candidate.name,
                'candidate_party': candidate.party,
                'timestamp': datetime.now().isoformat()
            }
            
            # Add to blockchain
            new_block = blockchain.add_vote(vote_data)
            
            # Update candidate vote count
            candidate.votes_count += 1
            candidate.save()
            
            # Mark voter as voted
            voter.has_voted = True
            voter.save()
            
            return Response({
                'message': 'Vote recorded with custom SHA-256 hashing',
                'voter_hash': voter_hash,
                'vote_data': vote_data,
                'block_index': new_block.index,
                'block_hash': new_block.hash[:16] + '...',
                'verified': True
            }, status=status.HTTP_201_CREATED)
        
        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=status.HTTP_404_NOT_FOUND)


class VerifyCustomHashView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        block_index = request.data.get('block_index')
        
        try:
            block = BlockchainBlock.objects.get(index=block_index)
            
            return Response({
                'block_index': block.index,
                'vote_data': block.vote_data,
                'block_hash': block.hash,
                'previous_hash': block.previous_hash,
                'verified': block.verified,
                'timestamp': block.timestamp
            }, status=status.HTTP_200_OK)
        
        except BlockchainBlock.DoesNotExist:
            return Response({'error': 'Block not found'}, status=status.HTTP_404_NOT_FOUND)