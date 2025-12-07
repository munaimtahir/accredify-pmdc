from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Evidence
from .serializers import EvidenceSerializer

class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.all().order_by('-created_at')
    serializer_class = EvidenceSerializer
    permission_classes = [IsAuthenticated]
