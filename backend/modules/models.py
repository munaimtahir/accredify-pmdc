from django.db import models
from core.models import BaseModel

class Module(BaseModel):
    code = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.display_name
