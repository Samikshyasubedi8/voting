# Create c:\Users\Sharada\OneDrive\Desktop\OVS-main\Backend\voting\custom_hash_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Vote, Candidate
from .custom_sha256 import VotingHasher
from datetime import datetime

class VoteWithCustomHashView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        voter = request.user
        candidate_id = request.data.get('candidate_id')
        
        if voter.has_voted:
            return Response({'error': 'You have already voted'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            candidate = Candidate.objects.get(id=candidate_id)
            
            # Create vote with custom SHA-256 hashing
            vote = Vote.objects.create(
                voter=voter,
                candidate=candidate,
                timestamp=datetime.now()
            )
            
            # Verify the hash
            vote_timestamp = vote.timestamp.isoformat()
            is_valid = VotingHasher.verify_vote(
                voter.voter_id,
                candidate_id,
                vote_timestamp,
                vote.vote_hash
            )
            vote.is_verified = is_valid
            vote.save()
            
            voter.has_voted = True
            voter.save()
            
            return Response({
                'message': 'Vote recorded with custom SHA-256 hashing',
                'voter_hash': vote.voter_hash,
                'vote_hash': vote.vote_hash,
                'verified': vote.is_verified
            }, status=status.HTTP_201_CREATED)
        
        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=status.HTTP_404_NOT_FOUND)

class VerifyCustomHashView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        vote_hash = request.data.get('vote_hash')
        
        try:
            vote = Vote.objects.get(vote_hash=vote_hash)
            is_valid = VotingHasher.verify_vote(
                vote.voter.voter_id,
                vote.candidate.id,
                vote.timestamp.isoformat(),
                vote.vote_hash
            )
            
            return Response({
                'vote_hash': vote.vote_hash,
                'voter_hash': vote.voter_hash,
                'candidate': vote.candidate.name,
                'verified': is_valid
            }, status=status.HTTP_200_OK)
        
        except Vote.DoesNotExist:
            return Response({'error': 'Vote not found'}, status=status.HTTP_404_NOT_FOUND)