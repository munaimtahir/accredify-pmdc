from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/modules/', include('modules.urls')),
    path('api/proformas/', include('proformas.urls')),
    path('api/assignments/', include('assignments.urls')),
    path('api/evidence/', include('evidence.urls')),
    path('api/organizations/', include('organizations.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
