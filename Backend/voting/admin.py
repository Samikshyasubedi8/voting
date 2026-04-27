from django.contrib import admin


from .models import Candidate ,Voter, BlockchainBlock, Blockchain, ElectionStatus

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['name', 'party', 'position', 'votes_count', 'created_at']
    list_filter = ['party', 'position', 'created_at']
    search_fields = ['name', 'party', 'bio']
    readonly_fields = ['votes_count', 'created_at']
    fields = ['name', 'party', 'bio', 'image', 'position', 'votes_count', 'created_at']

@admin.register(Voter)
class VoterAdmin(admin.ModelAdmin):
    list_display = ['voter_id', 'full_name', 'has_voted', 'registered_at']
    list_filter = ['has_voted', 'is_active']
    search_fields = ['voter_id', 'full_name']

@admin.register(BlockchainBlock)
class BlockchainBlockAdmin(admin.ModelAdmin):
    list_display = ['index', 'display_vote', 'verified', 'timestamp']
    list_filter = ['verified']
    readonly_fields = ['index', 'hash', 'previous_hash', 'nonce', 'vote_data', 'timestamp']
    search_fields = ['hash']
    
    def display_vote(self, obj):
        if obj.index == 0:
            return "Genesis Block"
        return obj.vote_data.get('candidate_name', 'Unknown')
    display_vote.short_description = 'Vote For'

@admin.register(Blockchain)
class BlockchainAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    readonly_fields = ['name', 'created_at']

@admin.register(ElectionStatus)
class ElectionStatusAdmin(admin.ModelAdmin):
    list_display = ['is_result_live', 'results_published_at', 'published_by']
    readonly_fields = ['results_published_at']


