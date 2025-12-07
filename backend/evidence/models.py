from django.db import models
from core.models import BaseModel
from assignments.models import Assignment, ItemStatus

class Evidence(BaseModel):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='evidence')
    item_status = models.ForeignKey(ItemStatus, on_delete=models.SET_NULL, null=True, blank=True, related_name='evidence')
    file = models.FileField(upload_to='evidence/')
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Evidence"

    def __str__(self):
        return f"Evidence for {self.assignment.title}"
