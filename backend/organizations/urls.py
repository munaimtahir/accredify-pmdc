from rest_framework.routers import DefaultRouter
from .views import InstitutionViewSet, ProgramViewSet

router = DefaultRouter()
router.register('institutions', InstitutionViewSet, basename='institution')
router.register('programs', ProgramViewSet, basename='program')

urlpatterns = router.urls
