from rest_framework import serializers
from .models import Assignment, ItemStatus

class ItemStatusSerializer(serializers.ModelSerializer):
    item_text = serializers.CharField(source='item.text', read_only=True)
    
    class Meta:
        model = ItemStatus
        fields = ['id', 'assignment', 'item', 'item_text', 'status', 'comment', 'score']

class AssignmentSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    template_title = serializers.CharField(source='template.title', read_only=True)
    item_statuses = ItemStatusSerializer(many=True, read_only=True)
    
    class Meta:
        model = Assignment
        fields = ['id', 'template', 'template_title', 'program', 'program_name', 'title', 'status', 'item_statuses', 'created_at', 'updated_at']
