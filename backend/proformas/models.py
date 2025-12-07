from django.db import models
from core.models import BaseModel
from modules.models import Module

class ProformaTemplate(BaseModel):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='templates')
    code = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    authority_name = models.CharField(max_length=255, blank=True, null=True)
    version = models.CharField(max_length=50, default="1.0")

    def __str__(self):
        return self.title

class ProformaSection(BaseModel):
    template = models.ForeignKey(ProformaTemplate, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.template.code} - {self.title}"

class ProformaItem(BaseModel):
    section = models.ForeignKey(ProformaSection, on_delete=models.CASCADE, related_name='items')
    text = models.TextField()
    order = models.PositiveIntegerField(default=1)
    weight = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.section.title} - {self.text[:50]}"
