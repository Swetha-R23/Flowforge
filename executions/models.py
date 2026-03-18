import uuid
from django.db import models
from django.utils import timezone


class Execution(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('canceled', 'Canceled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(
        'workflows.Workflow',
        on_delete=models.CASCADE,  # ← changed from PROTECT to CASCADE
        related_name='executions'
    )
    workflow_version = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    data = models.JSONField(default=dict)
    logs = models.JSONField(default=list)
    current_step_id = models.UUIDField(null=True, blank=True)
    retries = models.PositiveIntegerField(default=0)
    triggered_by = models.CharField(max_length=100, default='anonymous')
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'executions'
        ordering = ['-started_at']

    def __str__(self):
        return f"Execution({self.id}) [{self.status}]"