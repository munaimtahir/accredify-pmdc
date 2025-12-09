from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import PGItemCompliance
from .serializers import PGItemComplianceSerializer


class PGItemComplianceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing PG regulation checklist item compliance status.
    """
    queryset = PGItemCompliance.objects.all()
    serializer_class = PGItemComplianceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Optionally filter by institution or item.
        """
        queryset = super().get_queryset()
        institution_id = self.request.query_params.get('institution', None)
        item_id = self.request.query_params.get('item', None)
        
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        if item_id:
            queryset = queryset.filter(item_id=item_id)
            
        return queryset
    
    def perform_create(self, serializer):
        """
        Automatically set updated_by to current user.
        """
        serializer.save(updated_by=self.request.user)
    
    def perform_update(self, serializer):
        """
        Automatically set updated_by to current user on updates.
        """
        serializer.save(updated_by=self.request.user)
