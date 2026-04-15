from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Vote, Voter, Candidate
from .blockchain import voting_blockchain


class CastVoteBlockchainView(APIView):
    """Cast vote and record on blockchain"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            voter = request.user
            candidate_id = request.data.get('candidate_id')
            
            # Check if already voted
            if voter.has_voted:
                return Response(
                    {'error': 'Already voted'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get candidate
            try:
                candidate = Candidate.objects.get(id=candidate_id)
            except Candidate.DoesNotExist:
                return Response(
                    {'error': 'Candidate not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create vote in database
            vote = Vote.objects.create(
                voter=voter,
                candidate=candidate
            )
            
            # Add to blockchain
            block = voting_blockchain.add_vote(
                voter_id=voter.voter_id,
                candidate_id=candidate.id,
                candidate_name=candidate.name,
                timestamp=vote.timestamp.isoformat()
            )
            
            # Update voter and candidate
            voter.has_voted = True
            voter.save()
            
            candidate.votes_count += 1
            candidate.save()
            
            vote.is_verified = True
            vote.save()
            
            return Response({
                'message': 'Vote recorded on blockchain',
                'vote_hash': vote.vote_hash,
                'block_created': block is not None
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BlockchainView(APIView):
    """View entire blockchain"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'chain': voting_blockchain.get_all_blocks(),
            'pending_votes': voting_blockchain.pending_votes,
            'stats': voting_blockchain.get_stats()
        }, status=status.HTTP_200_OK)


class BlockDetailView(APIView):
    """View specific block"""
    permission_classes = [AllowAny]
    
    def get(self, request, block_index):
        if block_index >= len(voting_blockchain.chain):
            return Response(
                {'error': 'Block not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        block = voting_blockchain.chain[block_index]
        return Response(block.to_dict(), status=status.HTTP_200_OK)


class VerifyVoteView(APIView):
    """Verify if vote exists"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        vote_hash = request.data.get('vote_hash')
        exists = voting_blockchain.verify_vote(vote_hash)
        return Response({
            'vote_hash': vote_hash,
            'verified': exists
        }, status=status.HTTP_200_OK)


class CandidateVotesView(APIView):
    """Get all votes for candidate"""
    permission_classes = [AllowAny]
    
    def get(self, request, candidate_id):
        votes = voting_blockchain.get_votes_by_candidate(candidate_id)
        return Response({
            'candidate_id': candidate_id,
            'votes_count': len(votes),
            'votes': votes
        }, status=status.HTTP_200_OK)


class BlockchainStatsView(APIView):
    """Get blockchain statistics"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response(
            voting_blockchain.get_stats(),
            status=status.HTTP_200_OK
        )


class ValidateBlockchainView(APIView):
    """Validate blockchain integrity"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        is_valid = voting_blockchain.is_chain_valid()
        return Response({
            'valid': is_valid,
            'message': 'Valid' if is_valid else 'Tampered!'
        }, status=status.HTTP_200_OK)