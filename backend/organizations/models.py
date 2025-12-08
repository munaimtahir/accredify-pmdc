from django.db import models
from core.models import BaseModel

class Institution(BaseModel):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

class Program(BaseModel):
    name = models.CharField(max_length=255)
    level = models.CharField(max_length=50)  # e.g., 'Postgraduate', 'Undergraduate'
    discipline = models.CharField(max_length=100)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='programs')

    def __str__(self):
        return f"{self.name} - {self.institution.name}"
