from rest_framework import serializers
from .models import Workflow, Step, Rule


class RuleSerializer(serializers.ModelSerializer):
    next_step_name = serializers.CharField(
        source='next_step.name', read_only=True, allow_null=True
    )

    class Meta:
        model = Rule
        fields = [
            'id', 'step', 'condition', 'next_step', 'next_step_name',
            'priority', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_condition(self, value):
        if not value.strip():
            raise serializers.ValidationError("Condition cannot be empty.")
        return value.strip()

    def validate(self, data):
        step = data.get('step')
        next_step = data.get('next_step')
        if step and next_step:
            if str(step.workflow_id) != str(next_step.workflow_id):
                raise serializers.ValidationError(
                    "next_step must belong to the same workflow."
                )
        return data


class StepSerializer(serializers.ModelSerializer):
    rules = RuleSerializer(many=True, read_only=True)
    step_type_display = serializers.CharField(
        source='get_step_type_display', read_only=True
    )

    class Meta:
        model = Step
        fields = [
            'id', 'workflow', 'name', 'step_type', 'step_type_display',
            'order', 'metadata', 'rules', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StepWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ['id', 'workflow', 'name', 'step_type', 'order', 'metadata']
        read_only_fields = ['id']


class WorkflowListSerializer(serializers.ModelSerializer):
    step_count = serializers.SerializerMethodField()
    start_step_name = serializers.CharField(
        source='start_step.name', read_only=True, allow_null=True
    )

    class Meta:
        model = Workflow
        fields = [
            'id', 'name', 'version', 'is_active', 'step_count',
            'start_step', 'start_step_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'version', 'created_at', 'updated_at']

    def get_step_count(self, obj):
        return obj.steps.count()


class WorkflowDetailSerializer(serializers.ModelSerializer):
    steps = StepSerializer(many=True, read_only=True)
    start_step_name = serializers.CharField(
        source='start_step.name', read_only=True, allow_null=True
    )
    start_step = serializers.PrimaryKeyRelatedField(
        queryset=Step.objects.all(),
        allow_null=True,
        required=False
    )
    input_schema = serializers.JSONField(default=dict, required=False)

    class Meta:
        model = Workflow
        fields = [
            'id', 'name', 'version', 'is_active', 'input_schema',
            'start_step', 'start_step_name', 'steps', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'version', 'created_at', 'updated_at']

    def validate_input_schema(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("input_schema must be a JSON object.")
        for field_name, cfg in value.items():
            if not isinstance(cfg, dict):
                raise serializers.ValidationError(
                    f"Field '{field_name}' config must be a dict."
                )
            if 'type' not in cfg:
                raise serializers.ValidationError(
                    f"Field '{field_name}' must have a 'type'."
                )
            if cfg['type'] not in ['string', 'number', 'boolean']:
                raise serializers.ValidationError(
                    f"Field '{field_name}' type must be string, number, or boolean."
                )
        return value

    def create(self, validated_data):
        validated_data.pop('start_step', None)
        if validated_data.get('input_schema') is None:
            validated_data['input_schema'] = {}
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('start_step', None)
        if validated_data.get('input_schema') is None:
            validated_data['input_schema'] = {}
        return super().update(instance, validated_data)