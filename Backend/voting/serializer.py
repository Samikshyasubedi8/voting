import random
import string
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Candidate, Voter


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()  # This will be Voter ID
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data.get('identifier')
        password = data.get('password')

        # Try to authenticate with voter_id
        user = authenticate(username=identifier, password=password)
        if user is None:
            # If not found, try finding by voter_id and then authenticate
            try:
                voter = Voter.objects.get(voter_id=identifier)
                user = authenticate(username=voter.voter_id, password=password)
            except Voter.DoesNotExist:
                pass

        if user is None:
            raise serializers.ValidationError('Invalid Voter ID or password.')

        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')

        data['user'] = user
        return data


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    date_of_birth = serializers.DateField()
    citizenship_no = serializers.CharField(max_length=50)

    district = serializers.CharField(max_length=100)
    municipality = serializers.CharField(max_length=100)
    ward = serializers.CharField(max_length=10)

    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def generate_unique_voter_id(self):
        """Generate a unique 8-character alphanumeric Voter ID (permanent)"""
        # Format: 3 letters + 5 numbers (e.g., ABC12345)
        while True:
            letters = ''.join(random.choices(string.ascii_uppercase, k=3))
            numbers = ''.join(random.choices(string.digits, k=5))
            voter_id = f"{letters}{numbers}"
            
            # Check if this ID is already taken
            if not Voter.objects.filter(voter_id=voter_id).exists():
                return voter_id
            
    def create(self, validated_data):
        full_name = f"{validated_data['first_name']} {validated_data['last_name']}"
        
        # Generate permanent unique Voter ID (NOT using citizenship number)
        voter_id = self.generate_unique_voter_id()
        
        # Create email for internal use
        email = f"{voter_id}@voter.system"

        voter = Voter.objects.create_user(
            voter_id=voter_id,  # This is the permanent login ID
            password=validated_data["password"],
            email=email,
            full_name=full_name,
            
        )
        
        # If you have these fields in your Voter model, uncomment them
        # voter.date_of_birth = validated_data['date_of_birth']
        # voter.citizenship_no = validated_data['citizenship_no']
        # voter.district = validated_data['district']
        # voter.municipality = validated_data['municipality']
        # voter.ward = validated_data['ward']
        # voter.save()

        return voter


class VoterSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Voter
        fields = ['voter_id', 'full_name', 'email', 'has_voted', 'registered_at']


class ReactSerializer(serializers.ModelSerializer):
    voterId = serializers.CharField(source='voter_id')
    firstName = serializers.SerializerMethodField()
    lastName = serializers.SerializerMethodField()

    class Meta:
        model = Voter
        fields = ['voterId', 'firstName', 'lastName', 'email']

    def get_firstName(self, obj):
        parts = obj.full_name.strip().split()
        return parts[0] if parts else ''

    def get_lastName(self, obj):
        parts = obj.full_name.strip().split()
        return ' '.join(parts[1:]) if len(parts) > 1 else ''
    
class CandidateSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = ['id', 'name', 'party', 'bio', 'image', 'position', 'votes_count']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None