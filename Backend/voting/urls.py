from django.urls import path
from .views import CSRFTokenView, CandidateListView, LoginView, RegisterView, HomepageView
from .blockchain_views import (
    CastVoteBlockchainView, BlockchainView, BlockDetailView,
    VerifyVoteView, CandidateVotesView, BlockchainStatsView,
    ValidateBlockchainView)
urlpatterns = [
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('', HomepageView.as_view(), name='homepage'),
    path('candidates/', CandidateListView.as_view(), name='candidate-list'),
        # Blockchain routes
    path('vote-blockchain/', CastVoteBlockchainView.as_view(), name='vote-blockchain'),
    path('blockchain/', BlockchainView.as_view(), name='blockchain'),
    path('blockchain/block/<int:block_index>/', BlockDetailView.as_view(), name='block-detail'),
    path('blockchain/verify/', VerifyVoteView.as_view(), name='verify-vote'),
    path('blockchain/candidate/<int:candidate_id>/votes/', CandidateVotesView.as_view(), name='candidate-votes'),
    path('blockchain/stats/', BlockchainStatsView.as_view(), name='blockchain-stats'),
    path('blockchain/validate/', ValidateBlockchainView.as_view(), name='validate-blockchain'),
]