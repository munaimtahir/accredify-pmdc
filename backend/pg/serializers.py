from rest_framework import serializers
from .models import PGItemCompliance
from proformas.serializers import ProformaItemSerializer


class PGItemComplianceSerializer(serializers.ModelSerializer):
    item_details = ProformaItemSerializer(source='item', read_only=True)
    
    class Meta:
        model = PGItemCompliance
        fields = [
            'id', 'institution', 'item', 'item_details', 'status', 
            'comment', 'evidence_url', 'updated_by', 'updated_at'
        ]
        read_only_fields = ['updated_at']
