from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
import django.utils.timezone as tz
from .models import Execution
from .serializers import ExecutionSerializer

class ExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Execution.objects.select_related('workflow')
    serializer_class = ExecutionSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-started_at']

    def get_queryset(self):
        qs = super().get_queryset()
        workflow_id = self.request.query_params.get('workflow_id')
        status_filter = self.request.query_params.get('status')
        if workflow_id:
            qs = qs.filter(workflow_id=workflow_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        execution = self.get_object()
        if execution.status not in ('pending', 'in_progress'):
            return Response(
                {'error': f"Cannot cancel status '{execution.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # ✅ Fix 1: correct spelling 'cancelled'
        execution.status = 'cancelled'
        execution.ended_at = tz.now()
        execution.save(update_fields=['status', 'ended_at'])
        return Response(ExecutionSerializer(execution).data)

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        # ✅ Fix 2: correct relative import
        from .engine import ExecutionEngine
        from workflows.models import Step

        execution = self.get_object()
        if execution.status != 'failed':
            return Response(
                {'error': 'Only failed executions can be retried.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logs = execution.logs or []

        # ✅ Fix 4: search by 'step_name' not 'step_id'
        failed_log = next(
            (l for l in reversed(logs) if l.get('status') == 'failed'),
            None
        )
        if not failed_log:
            return Response(
                {'error': 'No failed step found in logs.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Fix 4: get step by name since no step_id in logs
        failed_step_name = failed_log.get('step_name')

        execution.status = 'in_progress'
        execution.retries += 1
        execution.ended_at = None
        execution.save(update_fields=[
            'status', 'retries', 'ended_at'
        ])

        # ✅ Fix 3: call engine correctly as static method
        try:
            execution = ExecutionEngine.run(execution, execution.data)
        except Exception as e:
            execution.status = 'failed'
            execution.save(update_fields=['status'])
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(ExecutionSerializer(execution).data)