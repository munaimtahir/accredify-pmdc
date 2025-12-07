from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Module
from .serializers import ModuleSerializer

class ModuleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Module.objects.all().order_by('display_name')
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]
