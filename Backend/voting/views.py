from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import transaction 
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import ListAPIView

from .models import Candidate , Voter , BlockchainBlock, ElectionStatus
 #from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from .custom_sha256 import VotingHasher
from datetime import datetime
from .blockchain import get_blockchain




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

class VoteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        voter = request.user
        
        # Check if already voted (by checking blockchain)
        blockchain = get_blockchain()
        voter_hash = VotingHasher.hash_voter_id(voter.voter_id)
        
        # Check if this voter_hash already exists in blockchain
        for block in blockchain.chain:
            if block.index > 0 and block.vote_data.get('voter_hash') == voter_hash:
                return Response({'error': 'Already voted!'}, status=400)
        
        candidate_id = request.data.get('candidate_id')
        candidate = Candidate.objects.get(id=candidate_id)
        
        # Mark voter as voted (in Voter model)
        voter.has_voted = True
        voter.save()
        
        # Update candidate vote count (for fast results)
        candidate.votes_count += 1
        candidate.save()
        
        # Store ONLY in blockchain (no Vote model!)
        vote_data = {
            'voter_hash': voter_hash,
            'candidate_id': candidate.id,
            'candidate_name': candidate.name,
            'timestamp': timezone.now().isoformat()
        }
        
        new_block = blockchain.add_vote(vote_data)
        
        return Response({
            'success': True,
            'message': 'Vote recorded on blockchain!',
            'block_index': new_block.index,
            'block_hash': new_block.hash[:16] + '...'
        })


class VoteStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        voter = request.user
        voter_hash = VotingHasher.hash_voter_id(voter.voter_id)
        
        # Check blockchain instead of Vote table
        blockchain = get_blockchain()
        has_voted = False
        vote_data = None
        
        for block in blockchain.chain:
            if block.index > 0 and block.vote_data.get('voter_hash') == voter_hash:
                has_voted = True
                vote_data = block.vote_data
                break
        
        if has_voted:
            return Response({
                'has_voted': True,
                'candidate_name': vote_data.get('candidate_name'),
                'candidate_id': vote_data.get('candidate_id'),
                'timestamp': block.timestamp
            })
        else:
            return Response({'has_voted': False})

class BlockchainAdminView(APIView):
    """Admin only - View full blockchain"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        blockchain = get_blockchain()
        
        blocks = []
        for block in blockchain.chain:
            blocks.append({
                'index': block.index,
                'timestamp': datetime.fromtimestamp(block.timestamp).isoformat(),
                'hash': block.hash,
                'previous_hash': block.previous_hash,
                'nonce': block.nonce,
                'vote_data': block.vote_data if block.index > 0 else None
            })
        
        return Response({
            'total_blocks': len(blockchain.chain),
            'total_votes': len([b for b in blockchain.chain if b.index > 0]),
            'chain_valid': blockchain.is_chain_valid(),
            'blocks': blocks
        }, status=status.HTTP_200_OK)

class ToggleResultsView(APIView):
    """Admin only - Turn results ON/OFF"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Check if user is admin
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        action = request.data.get('action')  # 'on' or 'off'
        
        status_obj, created = ElectionStatus.objects.get_or_create(id=1)
        
        if action == 'on':
            status_obj.is_result_live = True
            status_obj.results_published_at = timezone.now()
            status_obj.published_by = request.user
            status_obj.save()
            message = "Results are now LIVE and visible to everyone!"
        else:
            status_obj.is_result_live = False
            status_obj.save()
            message = "Results are now HIDDEN from public view."
        
        return Response({
            'success': True,
            'message': message,
            'is_result_live': status_obj.is_result_live
        }, status=status.HTTP_200_OK)


class ElectionResultsView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Get results from Candidate model (votes_count is updated when voting)
        candidates = Candidate.objects.all().order_by('-votes_count')
        total_votes = sum(c.votes_count for c in candidates)
        
        results = {}
        for candidate in candidates:
            results[candidate.name] = candidate.votes_count
        
        # Check election status
        try:
            status_obj = ElectionStatus.objects.get(id=1)
            is_live = status_obj.is_result_live
        except ElectionStatus.DoesNotExist:
            is_live = False
        
        is_admin = request.user.is_authenticated and request.user.is_staff
        
        if not is_live and not is_admin:
            return Response({
                'results_available': False,
                'message': 'Results are not yet available. Please wait for the official announcement.'
            })
        
        return Response({
            'results_available': True,
            'is_result_live': is_live,
            'total_votes_cast': total_votes,
            'results': results
        })

class AdminResultStatusView(APIView):
    """Admin can check current result status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            status_obj = ElectionStatus.objects.get(id=1)
            return Response({
                'is_result_live': status_obj.is_result_live,
                'results_published_at': status_obj.results_published_at,
                'published_by': status_obj.published_by.voter_id if status_obj.published_by else None
            })
        except ElectionStatus.DoesNotExist:
            return Response({'is_result_live': False, 'results_published_at': None})