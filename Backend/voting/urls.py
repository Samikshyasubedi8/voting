from django.urls import path
from .views import (
    CSRFTokenView, 
    CandidateListView, 
    LoginView, 
    RegisterView, 
    HomepageView,
    VerifyVoteView,
    VoteView, 
    VoteStatusView,
    BlockchainAdminView,
    CalculateResultsView,
    ToggleResultsView,
    GetResultsView,
    ResultStatusView
)
from .custom_hash_view import VoteWithCustomHashView, VerifyCustomHashView
from .views import GetResultsView as ElectionResultsView

urlpatterns = [
    # Basic endpoints
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('', HomepageView.as_view(), name='homepage'),
    path('candidates/', CandidateListView.as_view(), name='candidate-list'),
    
    # Voting endpoints
    path('vote/', VoteView.as_view(), name='vote'),
    path('vote-status/', VoteStatusView.as_view(), name='vote-status'),
    path('verify-vote/', VerifyVoteView.as_view(), name='verify-vote'),

    # Blockchain admin endpoints
    path('admin/blockchain/', BlockchainAdminView.as_view(), name='admin-blockchain'),
    
    # Result endpoints
    path('admin/calculate-results/', CalculateResultsView.as_view(), name='calculate-results'),
    path('admin/toggle-results/', ToggleResultsView.as_view(), name='toggle-results'),
    path('admin/result-status/', ResultStatusView.as_view(), name='result-status'),
    path('results/', GetResultsView.as_view(), name='results'),
    
    # Custom hash routes
    path('vote-custom-hash/', VoteWithCustomHashView.as_view(), name='vote-custom-hash'),
    path('verify-custom-hash/', VerifyCustomHashView.as_view(), name='verify-custom-hash'),
]