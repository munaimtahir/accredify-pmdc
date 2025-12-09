from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PGItemComplianceViewSet

router = DefaultRouter()
router.register(r'compliance', PGItemComplianceViewSet, basename='pg-compliance')

urlpatterns = [
    path('', include(router.urls)),
]
