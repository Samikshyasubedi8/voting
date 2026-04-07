from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


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

    # ✅ These two lines fix the clash error
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