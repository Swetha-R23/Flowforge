from rest_framework import serializers
from .models import Execution


class ExecutionSerializer(serializers.ModelSerializer):
    workflow_name = serializers.CharField(
        source='workflow.name', read_only=True
    )

    class Meta:
        model = Execution
        fields = [
            'id', 'workflow', 'workflow_name', 'workflow_version',
            'status', 'data', 'logs', 'current_step_id',
            'retries', 'triggered_by',
            'started_at', 'ended_at',
        ]
        read_only_fields = [
            'id', 'workflow_version', 'status', 'logs',
            'current_step_id', 'retries', 'started_at', 'ended_at',
        ]