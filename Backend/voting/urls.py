from django.urls import path
from .views import (
    CSRFTokenView, 
    CandidateListView, 
    LoginView, 
    RegisterView, 
    HomepageView,
    VoteView,
    VoteStatusView,
    ElectionResultsView ,
    AdminResultStatusView,
    ToggleResultsView


    
            
   
)
from .custom_hash_view import VoteWithCustomHashView, VerifyCustomHashView

urlpatterns = [
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('', HomepageView.as_view(), name='homepage'),
    path('candidates/', CandidateListView.as_view(), name='candidate-list'),
    
    # Blockchain voting endpoints
    path('vote/', VoteView.as_view(), name='vote'),                    # Cast vote
    path('vote-status/', VoteStatusView.as_view(), name='vote-status'), # Check status
   
    # Custom hash routes
    path('vote-custom-hash/', VoteWithCustomHashView.as_view(), name='vote-custom-hash'),
    path('verify-custom-hash/', VerifyCustomHashView.as_view(), name='verify-custom-hash'),

    path('election-results/', ElectionResultsView.as_view(), name='election-results'),
    path('admin/toggle-results/', ToggleResultsView.as_view(), name='toggle-results'),
    path('admin/result-status/', AdminResultStatusView.as_view(), name='result-status'),
]