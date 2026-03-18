from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Workflow, Step, Rule
from .serializers import (
    WorkflowListSerializer, WorkflowDetailSerializer,
    StepSerializer, StepWriteSerializer, RuleSerializer,
)


def _validate_input(schema, data):
    errors = []
    for field, cfg in schema.items():
        if cfg.get('required') and field not in data:
            errors.append(f"'{field}' is required.")
        if field in data:
            val = data[field]
            allowed = cfg.get('allowed_values')
            if allowed and str(val) not in [str(a) for a in allowed]:
                errors.append(f"'{field}' must be one of {allowed}.")
            if cfg.get('type') == 'number':
                try:
                    float(val)
                except (TypeError, ValueError):
                    errors.append(f"'{field}' must be a number.")
    return errors


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'version', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return WorkflowListSerializer
        return WorkflowDetailSerializer

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        from executions.engine import WorkflowEngine
        from executions.models import Execution
        from executions.serializers import ExecutionSerializer

        workflow = self.get_object()
        input_data = request.data.get('data', {})

        # Always auto-set start step to first step by order
        first_step = workflow.steps.order_by('order').first()

        if not first_step:
            return Response(
                {'errors': ['Workflow has no steps. Add steps before executing.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Force update start_step every time
        Workflow.objects.filter(pk=workflow.pk).update(start_step=first_step)
        workflow.start_step_id = first_step.id

        errors = _validate_input(workflow.input_schema or {}, input_data)
        if errors:
            return Response(
                {'errors': errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        execution = Execution.objects.create(
            workflow=workflow,
            workflow_version=workflow.version,
            status='pending',
            data=input_data,
            triggered_by='anonymous',
        )
        WorkflowEngine(execution).run()

        return Response(
            ExecutionSerializer(execution).data,
            status=status.HTTP_201_CREATED
        )
class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects.select_related('workflow').prefetch_related('rules')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return StepWriteSerializer
        return StepSerializer

    def get_queryset(self):
        workflow_id = self.kwargs.get('workflow_pk')
        if workflow_id:
            return self.queryset.filter(workflow_id=workflow_id)
        return self.queryset

    def perform_create(self, serializer):
        workflow_id = self.kwargs.get('workflow_pk')
        if workflow_id:
            workflow = get_object_or_404(Workflow, pk=workflow_id)
            serializer.save(workflow=workflow)
        else:
            serializer.save()


class RuleViewSet(viewsets.ModelViewSet):
    queryset = Rule.objects.select_related('step', 'next_step')
    serializer_class = RuleSerializer

    def get_queryset(self):
        step_id = self.kwargs.get('step_pk')
        if step_id:
            return self.queryset.filter(step_id=step_id)
        return self.queryset

    def perform_create(self, serializer):
        step_id = self.kwargs.get('step_pk')
        if step_id:
            step = get_object_or_404(Step, pk=step_id)
            serializer.save(step=step)
        else:
            serializer.save()