from django.contrib import admin


from .models import Candidate

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['name', 'party', 'position', 'votes_count', 'created_at']
    list_filter = ['party', 'position', 'created_at']
    search_fields = ['name', 'party', 'bio']
    readonly_fields = ['votes_count', 'created_at']
    fields = ['name', 'party', 'bio', 'image', 'position', 'votes_count', 'created_at']