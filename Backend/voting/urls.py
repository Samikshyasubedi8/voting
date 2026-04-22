from django.urls import path
from .views import (
    CSRFTokenView, 
    CandidateListView, 
    LoginView, 
    RegisterView, 
    HomepageView,
    BlockchainVoteView,
    VoteStatusView,
    BlockchainVerificationView
)
from .custom_hash_view import VoteWithCustomHashView, VerifyCustomHashView

urlpatterns = [
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('', HomepageView.as_view(), name='homepage'),
    path('candidates/', CandidateListView.as_view(), name='candidate-list'),
    
    # Blockchain voting endpoints
    path('blockchain-vote/', BlockchainVoteView.as_view(), name='blockchain-vote'),
    path('vote-status/', VoteStatusView.as_view(), name='vote-status'),
    path('verify-blockchain/', BlockchainVerificationView.as_view(), name='verify-blockchain'),
    
    # Custom hash routes
    path('vote-custom-hash/', VoteWithCustomHashView.as_view(), name='vote-custom-hash'),
    path('verify-custom-hash/', VerifyCustomHashView.as_view(), name='verify-custom-hash'),
]