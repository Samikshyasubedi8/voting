import uuid
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

from .models import Candidate, BlockchainBlock, ElectionStatus, VoteReceipt, Voter
from .custom_sha256 import VotingHasher
from datetime import datetime
from .blockchain import get_blockchain
from .serializer import LoginSerializer, VoterSerializer, ReactSerializer, RegisterSerializer, CandidateSerializer


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
            'voterId': voter.voter_id,
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
        
        if voter.has_voted:
            return Response({'error': 'You have already voted!'}, status=400)
        
        candidate_id = request.data.get('candidate_id')
        try:
            candidate = Candidate.objects.get(id=candidate_id)
        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=404)
        
        # Mark voter as voted
        voter.has_voted = True
        voter.save()
        
        # Update candidate vote count
        candidate.votes_count += 1
        candidate.save()
        
        # Generate receipt ID
        receipt_id = str(uuid.uuid4())
        
        # Store in blockchain - NO voter identifier
        vote_data = {
            'candidate_id': candidate.id,
            'candidate_name': candidate.name,
            'candidate_party': candidate.party,
            'timestamp': timezone.now().isoformat(),
            'receipt_id': receipt_id
        }
        
        # Add to blockchain
        blockchain = get_blockchain()
        new_block = blockchain.add_vote(vote_data)
        
        # Store receipt for voter (not visible to admin in blockchain view)
        from .models import VoteReceipt
        VoteReceipt.objects.create(
            voter=voter,
            receipt_id=receipt_id,
            block_index=new_block.index,
            candidate_name=candidate.name
        )
        
        return Response({
            'success': True,
            'message': 'Your vote has been recorded anonymously!',
            'receipt_id': receipt_id,
            'block_index': new_block.index,
            'candidate': candidate.name
        })

# Replace your existing VoteStatusView with this:
class VoteStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        voter = request.user
        
        # Simply check the Voter model flag - NO blockchain check needed
        if voter.has_voted:
            return Response({
                'has_voted': True
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


class CalculateResultsView(APIView):
    """Admin only - Calculate results from blockchain"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all vote blocks from blockchain (excluding genesis block)
        vote_blocks = BlockchainBlock.objects.filter(index__gt=0)
        
        # Calculate results from blockchain
        results = {}
        total_votes = 0
        
        for block in vote_blocks:
            candidate_name = block.vote_data.get('candidate_name')
            if candidate_name:
                results[candidate_name] = results.get(candidate_name, 0) + 1
                total_votes += 1
        
        # Update candidate vote counts in database (for fast display)
        for candidate in Candidate.objects.all():
            blockchain_count = results.get(candidate.name, 0)
            if candidate.votes_count != blockchain_count:
                candidate.votes_count = blockchain_count
                candidate.save()
        
        # Get or create election status
        status_obj, created = ElectionStatus.objects.get_or_create(id=1)
        status_obj.total_votes_cast = total_votes
        status_obj.last_calculated = timezone.now()
        status_obj.save()
        
        return Response({
            'success': True,
            'message': 'Results calculated from blockchain!',
            'total_votes': total_votes,
            'results': results,
            'calculated_at': status_obj.last_calculated
        }, status=status.HTTP_200_OK)


class ToggleResultsView(APIView):
    """Admin only - Turn results ON/OFF for public view"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        action = request.data.get('action')  # 'on' or 'off'
        
        status_obj, created = ElectionStatus.objects.get_or_create(id=1)
        
        if action == 'on':
            # First calculate results before publishing
            vote_blocks = BlockchainBlock.objects.filter(index__gt=0)
            results = {}
            for block in vote_blocks:
                candidate_name = block.vote_data.get('candidate_name')
                if candidate_name:
                    results[candidate_name] = results.get(candidate_name, 0) + 1
            
            status_obj.is_result_live = True
            status_obj.results_published_at = timezone.now()
            status_obj.published_by = request.user
            status_obj.total_votes_cast = sum(results.values())
            status_obj.last_calculated = timezone.now()
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


class GetResultsView(APIView):
    """Get election results - visibility controlled by admin"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Get election status
        try:
            status_obj = ElectionStatus.objects.get(id=1)
            is_live = status_obj.is_result_live
            total_votes = status_obj.total_votes_cast
            last_calculated = status_obj.last_calculated
        except ElectionStatus.DoesNotExist:
            is_live = False
            total_votes = 0
            last_calculated = None
        
        # Admin can always see results
        is_admin = request.user.is_authenticated and request.user.is_staff
        
        if not is_live and not is_admin:
            return Response({
                'results_available': False,
                'message': 'Results are not yet available. Please wait for the official announcement.',
                'is_result_live': False
            }, status=status.HTTP_200_OK)
        
        # Calculate results from blockchain (always fresh)
        vote_blocks = BlockchainBlock.objects.filter(index__gt=0)
        
        results = {}
        for block in vote_blocks:
            candidate_name = block.vote_data.get('candidate_name')
            if candidate_name:
                results[candidate_name] = results.get(candidate_name, 0) + 1
        
        # Get candidate details
        candidates = Candidate.objects.all()
        candidate_details = []
        for candidate in candidates:
            candidate_details.append({
                'name': candidate.name,
                'party': candidate.party,
                'votes': results.get(candidate.name, 0),
                'image': candidate.image.url if candidate.image else None
            })
        
        # Sort by votes (highest first)
        candidate_details.sort(key=lambda x: x['votes'], reverse=True)
        
        return Response({
            'results_available': True,
            'is_result_live': is_live,
            'total_votes_cast': total_votes,
            'last_calculated': last_calculated,
            'results': candidate_details,
            'winner': candidate_details[0] if candidate_details else None
        }, status=status.HTTP_200_OK)


class ResultStatusView(APIView):
    """Check current result status (Admin only)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            status_obj = ElectionStatus.objects.get(id=1)
            return Response({
                'is_result_live': status_obj.is_result_live,
                'results_published_at': status_obj.results_published_at,
                'published_by': status_obj.published_by.voter_id if status_obj.published_by else None,
                'total_votes_cast': status_obj.total_votes_cast,
                'last_calculated': status_obj.last_calculated
            })
        except ElectionStatus.DoesNotExist:
            return Response({
                'is_result_live': False,
                'results_published_at': None,
                'published_by': None,
                'total_votes_cast': 0,
                'last_calculated': None
            })

class VerifyVoteView(APIView):
    """Voters can verify their vote using their stored receipt"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        voter = request.user
        
        try:
            receipt = VoteReceipt.objects.get(voter=voter)
            
            # Get the block from blockchain
            block = BlockchainBlock.objects.get(index=receipt.block_index)
            
            return Response({
                'has_voted': True,
                'receipt_id': receipt.receipt_id,
                'block_index': receipt.block_index,
                'candidate_name': receipt.candidate_name,
                'block_hash': block.hash[:16] + '...',
                'verified': block.vote_data.get('receipt_id') == str(receipt.receipt_id),
                'timestamp': block.timestamp
            })
        except VoteReceipt.DoesNotExist:
            return Response({'has_voted': False})