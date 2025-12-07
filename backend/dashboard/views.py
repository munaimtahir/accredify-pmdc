from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from modules.models import Module
from proformas.models import ProformaTemplate

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def summary(request):
    return Response({
        "modules": Module.objects.count(),
        "templates": ProformaTemplate.objects.count(),
    })
