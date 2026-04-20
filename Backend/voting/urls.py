from django.urls import path
from .views import CSRFTokenView, CandidateListView, LoginView, RegisterView, HomepageView
from .custom_hash_view import VoteWithCustomHashView, VerifyCustomHashView

urlpatterns = [
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('', HomepageView.as_view(), name='homepage'),
    path('candidates/', CandidateListView.as_view(), name='candidate-list'),
        # Blockchain routes
   
    path('vote-custom-hash/', VoteWithCustomHashView.as_view(), name='vote-custom-hash'),
    path('verify-custom-hash/', VerifyCustomHashView.as_view(), name='verify-custom-hash'),

]