from django.db import models
from core.models import BaseModel
from proformas.models import ProformaTemplate, ProformaItem
from organizations.models import Program

class Assignment(BaseModel):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
    ]
    
    template = models.ForeignKey(ProformaTemplate, on_delete=models.CASCADE, related_name='assignments')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    def __str__(self):
        return f"{self.title} - {self.program.name}"

class ItemStatus(BaseModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('compliant', 'Compliant'),
        ('noncompliant', 'Non-Compliant'),
        ('partial', 'Partial'),
    ]
    
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='item_statuses')
    item = models.ForeignKey(ProformaItem, on_delete=models.CASCADE, related_name='statuses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    comment = models.TextField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Item Statuses"

    def __str__(self):
        return f"{self.assignment.title} - {self.item.text[:30]} - {self.status}"
