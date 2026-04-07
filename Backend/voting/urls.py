from django.urls import path
from .views import CSRFTokenView, CandidateListView, LoginView, RegisterView, HomepageView

urlpatterns = [
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('', HomepageView.as_view(), name='homepage'),
     path('candidates/', CandidateListView.as_view(), name='candidate-list'),

]