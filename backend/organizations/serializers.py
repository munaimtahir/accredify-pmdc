from rest_framework import serializers
from .models import Institution, Program

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name', 'city', 'type']

class ProgramSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    
    class Meta:
        model = Program
        fields = ['id', 'name', 'level', 'discipline', 'institution', 'institution_name']
