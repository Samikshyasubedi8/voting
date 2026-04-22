
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from datetime import datetime
from .custom_sha256 import VotingHasher


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


class Voter(AbstractBaseUser, PermissionsMixin):
    voter_id      = models.CharField(max_length=50, unique=True)
    full_name     = models.CharField(max_length=150)
    email         = models.EmailField(unique=True)
    is_active     = models.BooleanField(default=True)
    is_staff      = models.BooleanField(default=False)
    has_voted     = models.BooleanField(default=False)
    registered_at = models.DateTimeField(auto_now_add=True)

    date_of_birth = models.DateField(null=True, blank=True)
    citizenship_no = models.CharField(max_length=50, null=True, blank=True)
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

class Vote(models.Model):
    voter = models.OneToOneField(Voter, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    voter_hash = models.CharField(max_length=255)  # Hashed voter ID
    vote_hash = models.CharField(max_length=255)   # Immutable vote hash
    timestamp = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Create hashes using custom SHA-256
        self.voter_hash = VotingHasher.hash_voter_id(self.voter.voter_id)
        vote_timestamp = self.timestamp.isoformat() if self.timestamp else datetime.now().isoformat()
        self.vote_hash = VotingHasher.hash_vote(
            self.voter.voter_id,
            self.candidate.id,
            vote_timestamp
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Vote {self.vote_hash[:10]}... for {self.candidate.name}"