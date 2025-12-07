from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Institution, Program
from .serializers import InstitutionSerializer, ProgramSerializer

class InstitutionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Institution.objects.all().order_by('name')
    serializer_class = InstitutionSerializer
    permission_classes = [IsAuthenticated]

class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Program.objects.all().order_by('name')
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]
