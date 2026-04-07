from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Voter


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()   # matches your React field name
    password   = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data.get('identifier')
        password   = data.get('password')

        # Allow login by voter_id OR email
        user = authenticate(username=identifier, password=password)

        if user is None:
            # Try email lookup as fallback
            try:
                voter = Voter.objects.get(email=identifier)
                user = authenticate(username=voter.voter_id, password=password)
            except Voter.DoesNotExist:
                pass

        if user is None or not user.is_active:
            raise serializers.ValidationError('Invalid credentials.')

        data['user'] = user
        return data


class RegisterSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150)
    dateOfBirth = serializers.DateField()
    citizenshipNumber = serializers.CharField(max_length=50)
    district = serializers.CharField(max_length=100)
    municipality = serializers.CharField(max_length=100)
    ward = serializers.CharField(max_length=10)
    password = serializers.CharField(write_only=True, min_length=6)
    confirmPassword = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        if data['password'] != data['confirmPassword']:
            raise serializers.ValidationError('Passwords do not match.')
        return data

    def create(self, validated_data):
        full_name = f"{validated_data['firstName']} {validated_data['lastName']}"
        voter_id = validated_data['citizenshipNumber'].replace('-', '')
        
        voter = Voter.objects.create_user(
            voter_id=voter_id,
            password=validated_data['password'],
            email=f"{voter_id}@voter.local",
            full_name=full_name,
        )
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