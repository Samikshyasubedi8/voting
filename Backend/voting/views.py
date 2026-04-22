from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import transaction 

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import ListAPIView
from .models import Candidate , Vote
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from .custom_sha256 import VotingHasher
from datetime import datetime


from .serializer import LoginSerializer, VoterSerializer, ReactSerializer, RegisterSerializer , CandidateSerializer

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'token': str(refresh.access_token)}

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'message': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response({**tokens, 'user': ReactSerializer(user).data}, status=status.HTTP_200_OK)

class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        voter = serializer.save()
        return Response({
            'success': True,
            'voterId': voter.voter_id,  # Permanent Voter ID
            'full_name': voter.full_name,
            'message': f'Registration successful! Your Voter ID is: {voter.voter_id}'
        }, status=status.HTTP_201_CREATED)

class CSRFTokenView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({'detail': 'CSRF cookie set'}, status=status.HTTP_200_OK)


class HomepageView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({"message": "Welcome to the Voting System API"}, status=status.HTTP_200_OK)

class CandidateListView(ListAPIView):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class BlockchainVoteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        voter = request.user
        
        # Check if already voted
        if voter.has_voted:
            return Response(
                {'error': 'You have already cast your vote'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        candidate_id = request.data.get('candidate_id')
        if not candidate_id:
            return Response(
                {'error': 'Candidate ID required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            candidate = Candidate.objects.get(id=candidate_id)
        except Candidate.DoesNotExist:
            return Response(
                {'error': 'Candidate not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create blockchain vote
        with transaction.atomic():
            # Create vote with custom SHA-256 hashing
            vote = Vote.objects.create(
                voter=voter,
                candidate=candidate
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
            
            # Update candidate votes
            candidate.votes_count += 1
            candidate.save()
            
            # Mark voter as voted
            voter.has_voted = True
            voter.save()
        
        return Response({
            'success': True,
            'message': 'Vote recorded on blockchain',
            'blockchain_data': {
                'voter_hash': vote.voter_hash,
                'vote_hash': vote.vote_hash,
                'candidate': candidate.name,
                'candidate_id': candidate.id,
                'timestamp': vote.timestamp.isoformat(),
                'verified_on_blockchain': vote.is_verified,
                'transaction_id': vote.id
            }
        }, status=status.HTTP_201_CREATED)

class VoteStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        voter = request.user
        
        if voter.has_voted:
            try:
                vote = Vote.objects.get(voter=voter)
                return Response({
                    'has_voted': True,
                    'candidate_name': vote.candidate.name,
                    'candidate_id': vote.candidate.id,
                    'vote_hash': vote.vote_hash,
                    'voter_hash': vote.voter_hash,
                    'timestamp': vote.timestamp,
                    'verified': vote.is_verified
                })
            except Vote.DoesNotExist:
                return Response({'has_voted': False})
        else:
            return Response({'has_voted': False})

class BlockchainVerificationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Verify all votes on the blockchain"""
        votes = Vote.objects.select_related('voter', 'candidate').all()
        
        verification_results = []
        for vote in votes:
            # Recalculate hash to verify integrity
            vote_timestamp = vote.timestamp.isoformat()
            recalculated_hash = VotingHasher.hash_vote(
                vote.voter.voter_id,
                vote.candidate.id,
                vote_timestamp
            )
            
            is_valid = recalculated_hash == vote.vote_hash
            
            verification_results.append({
                'vote_id': vote.id,
                'candidate': vote.candidate.name,
                'timestamp': vote.timestamp,
                'hash_valid': is_valid,
                'vote_hash': vote.vote_hash[:16] + '...'
            })
        
        total_votes = votes.count()
        valid_votes = sum(1 for v in verification_results if v['hash_valid'])
        
        return Response({
            'total_votes': total_votes,
            'valid_votes': valid_votes,
            'tampered_votes': total_votes - valid_votes,
            'is_blockchain_secure': valid_votes == total_votes,
            'verification_details': verification_results
        })