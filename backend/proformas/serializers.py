from rest_framework import serializers
from .models import ProformaTemplate, ProformaSection, ProformaItem

class ProformaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProformaItem
        fields = ['id', 'text', 'order', 'weight']

class ProformaSectionSerializer(serializers.ModelSerializer):
    items = ProformaItemSerializer(many=True, read_only=True)

    class Meta:
        model = ProformaSection
        fields = ['id', 'title', 'order', 'items']

class ProformaTemplateSerializer(serializers.ModelSerializer):
    sections = ProformaSectionSerializer(many=True, read_only=True)

    class Meta:
        model = ProformaTemplate
        fields = ['id', 'code', 'title', 'authority_name', 'version', 'sections']
