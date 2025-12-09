from rest_framework import serializers
from .models import ProformaTemplate, ProformaSection, ProformaItem

class ProformaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProformaItem
        fields = [
            'id', 'code', 'text', 'requirement_text', 'required_evidence_type',
            'importance_level', 'implementation_criteria', 'order', 'weight',
            'max_score', 'weightage_percent', 'is_licensing_critical'
        ]

class ProformaSectionSerializer(serializers.ModelSerializer):
    items = ProformaItemSerializer(many=True, read_only=True)

    class Meta:
        model = ProformaSection
        fields = ['id', 'code', 'title', 'description', 'order', 'weight', 'items']

class ProformaTemplateSerializer(serializers.ModelSerializer):
    sections = ProformaSectionSerializer(many=True, read_only=True)

    class Meta:
        model = ProformaTemplate
        fields = [
            'id', 'code', 'title', 'authority_name', 'version', 
            'description', 'is_active', 'sections'
        ]
