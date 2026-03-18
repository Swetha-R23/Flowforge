import uuid
from django.db import models
from django.utils import timezone


class Workflow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    input_schema = models.JSONField(default=dict, blank=True, null=True)
    start_step = models.ForeignKey(
        'Step', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='workflow_start'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workflows'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (v{self.version})"

    def save(self, *args, **kwargs):
        if self.input_schema is None:
            self.input_schema = {}
        if self.pk and Workflow.objects.filter(pk=self.pk).exists():
            Workflow.objects.filter(pk=self.pk).update(
                version=models.F('version') + 1
            )
            self._version_incremented = True
        super().save(*args, **kwargs)
        if getattr(self, '_version_incremented', False):
            self.refresh_from_db(fields=['version'])


class Step(models.Model):
    STEP_TYPES = [
        ('task', 'Task'),
        ('approval', 'Approval'),
        ('notification', 'Notification'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(
        Workflow, on_delete=models.CASCADE, related_name='steps'
    )
    name = models.CharField(max_length=255)
    step_type = models.CharField(max_length=20, choices=STEP_TYPES)
    order = models.PositiveIntegerField(default=1)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'steps'
        ordering = ['order']

    def __str__(self):
        return f"{self.workflow.name} → {self.name}"


class Rule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    step = models.ForeignKey(
        Step, on_delete=models.CASCADE, related_name='rules'
    )
    condition = models.TextField()
    next_step = models.ForeignKey(
        Step, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='incoming_rules'
    )
    priority = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rules'
        ordering = ['priority']

    def __str__(self):
        return f"Rule(p={self.priority}): {self.condition[:50]}"