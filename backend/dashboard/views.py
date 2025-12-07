from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from modules.models import Module
from proformas.models import ProformaTemplate
from assignments.models import Assignment
from organizations.models import Program
from evidence.models import Evidence

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def summary(request):
    return Response({
        "modules": Module.objects.count(),
        "templates": ProformaTemplate.objects.count(),
        "assignments": Assignment.objects.count(),
        "programs": Program.objects.count(),
        "evidence": Evidence.objects.count(),
    })
