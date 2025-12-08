from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Assignment, ItemStatus
from .serializers import AssignmentSerializer, ItemStatusSerializer

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all().order_by('-created_at')
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

class ItemStatusViewSet(viewsets.ModelViewSet):
    queryset = ItemStatus.objects.all()
    serializer_class = ItemStatusSerializer
    permission_classes = [IsAuthenticated]
