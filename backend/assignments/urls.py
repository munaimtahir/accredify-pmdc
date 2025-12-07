from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, ItemStatusViewSet

router = DefaultRouter()
router.register('', AssignmentViewSet, basename='assignment')
router.register('item-statuses', ItemStatusViewSet, basename='itemstatus')

urlpatterns = router.urls
