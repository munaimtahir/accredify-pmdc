from rest_framework.routers import DefaultRouter
from .views import ProformaTemplateViewSet

router = DefaultRouter()
router.register('', ProformaTemplateViewSet, basename='proforma')

urlpatterns = router.urls
