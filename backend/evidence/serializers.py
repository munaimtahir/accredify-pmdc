from rest_framework import serializers
from .models import Evidence

class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = ['id', 'assignment', 'item_status', 'file', 'description', 'created_at']
