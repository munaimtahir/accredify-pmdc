from django.db import models
from core.models import BaseModel
from modules.models import Module

class ProformaTemplate(BaseModel):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='templates')
    code = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    authority_name = models.CharField(max_length=255, blank=True, null=True)
    version = models.CharField(max_length=50, default="1.0")
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class ProformaSection(BaseModel):
    template = models.ForeignKey(ProformaTemplate, on_delete=models.CASCADE, related_name='sections')
    code = models.CharField(max_length=100, blank=True, default="")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=1)
    weight = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.template.code} - {self.title}"

class ProformaItem(BaseModel):
    section = models.ForeignKey(ProformaSection, on_delete=models.CASCADE, related_name='items')
    code = models.CharField(max_length=100, blank=True, default="")
    text = models.TextField()
    requirement_text = models.TextField(blank=True, default="")
    required_evidence_type = models.CharField(max_length=255, blank=True, default="")
    importance_level = models.PositiveIntegerField(blank=True, null=True)
    implementation_criteria = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=1)
    weight = models.PositiveIntegerField(default=1)
    max_score = models.PositiveIntegerField(default=10)
    weightage_percent = models.PositiveIntegerField(default=100)
    is_licensing_critical = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.section.title} - {self.text[:50]}"
