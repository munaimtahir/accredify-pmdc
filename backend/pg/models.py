from django.conf import settings
from django.db import models
from core.models import BaseModel
from proformas.models import ProformaItem
from organizations.models import Institution


class PGItemCompliance(BaseModel):
    """
    Tracks compliance status for PG regulation checklist items per institution.
    """
    STATUS_CHOICES = [
        ('YES', 'Yes'),
        ('NO', 'No'),
        ('PARTIAL', 'Partial'),
        ('NA', 'Not Applicable'),
    ]
    
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name='pg_item_compliances',
        null=True,
        blank=True
    )
    item = models.ForeignKey(
        ProformaItem,
        on_delete=models.CASCADE,
        related_name='pg_compliances'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='NO'
    )
    comment = models.TextField(blank=True, default="")
    evidence_url = models.URLField(blank=True, default="")
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = "PG Item Compliance"
        verbose_name_plural = "PG Item Compliances"
        # Ensure only one compliance record per institution-item pair
        unique_together = ['institution', 'item']
    
    def __str__(self):
        inst_name = self.institution.name if self.institution else "No Institution"
        item_code = self.item.code or self.item.id
        return f"{inst_name} - {item_code} - {self.status}"
