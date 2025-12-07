from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ProformaTemplate
from .serializers import ProformaTemplateSerializer

class ProformaTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProformaTemplate.objects.all()
    serializer_class = ProformaTemplateSerializer
    permission_classes = [IsAuthenticated]
