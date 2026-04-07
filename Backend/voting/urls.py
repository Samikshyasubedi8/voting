from django.urls import path
from .views import CSRFTokenView, LoginView, RegisterView

urlpatterns = [
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
]