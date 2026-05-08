import uuid

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from datetime import datetime
from .custom_sha256 import VotingHasher
from django.utils import timezone


"""class VoterManager(BaseUserManager):
    def create_user(self, voter_id, password=None, **extra_fields):
        if not voter_id:
            raise ValueError('Voter ID is required')
        user = self.model(voter_id=voter_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, voter_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(voter_id, password, **extra_fields)  """

class VoterManager(BaseUserManager):
    def create_user(self, voter_id, password=None, **extra_fields):
        if not voter_id:
            raise ValueError('Voter ID is required')
        user = self.model(voter_id=voter_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, voter_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(voter_id, password, **extra_fields)
    
  # It's crucial for authentication
    def get_by_natural_key(self, username):
        return self.get(voter_id=username)


class Voter(AbstractBaseUser, PermissionsMixin):
    voter_id      = models.CharField(max_length=50, unique=True)
    full_name     = models.CharField(max_length=150)
    email         = models.EmailField(unique=True)
    is_active     = models.BooleanField(default=True)
    is_staff      = models.BooleanField(default=False)
    has_voted     = models.BooleanField(default=False)
    registered_at = models.DateTimeField(auto_now_add=True)

    date_of_birth = models.DateField(null=True, blank=True)
    citizenship_no = models.CharField(max_length=20, null=True, blank=True)
    district = models.CharField(max_length=100, null=True, blank=True)
    municipality = models.CharField(max_length=100, null=True, blank=True)
    ward = models.CharField(max_length=10, null=True, blank=True)

    groups = models.ManyToManyField(
        'auth.Group',
        blank=True,
        related_name='voter_set',          # ← fixes groups clash
        related_query_name='voter',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        blank=True,
        related_name='voter_set',          # ← fixes user_permissions clash
        related_query_name='voter',
    )

    USERNAME_FIELD  = 'voter_id'
    REQUIRED_FIELDS = ['email', 'full_name']

    objects = VoterManager()

    def __str__(self):
        return self.voter_id

class Candidate(models.Model):
    name = models.CharField(max_length=150)
    party = models.CharField(max_length=100)
    bio = models.TextField()
    image = models.ImageField(upload_to='candidates/', null=True, blank=True)
    position = models.CharField(max_length=100, default='Mayor')  # e.g., Mayor, Representative
    votes_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.party}"

    class Meta:
        ordering = ['-votes_count']



class BlockchainBlock(models.Model):
    index = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    vote_data = models.JSONField()
    previous_hash = models.CharField(max_length=64)
    hash = models.CharField(max_length=64, unique=True)
    nonce = models.IntegerField(default=0)
    verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Block {self.index} - {self.hash[:10]}"

class Blockchain(models.Model):
    name = models.CharField(max_length=100, default='Voting Blockchain')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class VoterManager(BaseUserManager):
    def create_user(self, voter_id, password=None, **extra_fields):
        if not voter_id:
            raise ValueError('Voter ID is required')
        user = self.model(voter_id=voter_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, voter_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(voter_id, password, **extra_fields)
    
  # It's crucial for authentication
    def get_by_natural_key(self, username):
        return self.get(voter_id=username)





class ElectionStatus(models.Model):
    """Controls when results are visible to the public"""
    is_result_live = models.BooleanField(default=False)
    results_published_at = models.DateTimeField(null=True, blank=True)
    published_by = models.ForeignKey(Voter, on_delete=models.SET_NULL, null=True, blank=True)
    total_votes_cast = models.IntegerField(default=0)
    last_calculated = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Election Status"
    
    def __str__(self):
        return f"Results Live: {self.is_result_live}"

# models.py - Add this model

class VoteReceipt(models.Model):
    """Stores vote receipt for voters to verify their vote (not visible to admin)"""
    voter = models.OneToOneField(Voter, on_delete=models.CASCADE, related_name='receipt')
    receipt_id = models.UUIDField(unique=True, default=uuid.uuid4)
    block_index = models.IntegerField()
    candidate_name = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Receipt for {self.voter.voter_id[:10]}..."