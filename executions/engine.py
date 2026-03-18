import logging
import django.utils.timezone as tz
from workflows.rule_engine import evaluate_condition

logger = logging.getLogger(__name__)
MAX_ITERATIONS = 50


class WorkflowEngine:

    def __init__(self, execution):
        self.execution = execution
        self.workflow = execution.workflow
        self.data = execution.data or {}

    def run(self):
        from workflows.models import Step

        self.execution.status = 'in_progress'
        self.execution.save(update_fields=['status'])

        steps = {
            str(s.id): s
            for s in Step.objects.filter(
                workflow=self.workflow
            ).prefetch_related('rules')
        }

        # Get start step — use start_step_id or fallback to first step
        start_step_id = (
            str(self.workflow.start_step_id)
            if self.workflow.start_step_id else None
        )

        if not start_step_id:
            first = Step.objects.filter(
                workflow=self.workflow
            ).order_by('order').first()
            if first:
                start_step_id = str(first.id)

        if not start_step_id:
            self._fail("Workflow has no steps defined.")
            return

        current_id = start_step_id
        logs = []
        iteration = 0

        while current_id and iteration < MAX_ITERATIONS:
            iteration += 1
            step = steps.get(current_id)

            if not step:
                self._fail(f"Step '{current_id}' not found.", logs)
                return

            self.execution.current_step_id = current_id
            self.execution.save(update_fields=['current_step_id'])

            log_entry, next_id = self._execute_step(step)
            logs.append(log_entry)

            if log_entry['status'] == 'failed':
                self._fail(
                    log_entry.get('error_message', 'Step failed.'), logs
                )
                return

            current_id = next_id

        if iteration >= MAX_ITERATIONS:
            self._fail(
                "Max iterations reached — possible infinite loop.", logs
            )
            return

        self.execution.status = 'completed'
        self.execution.logs = logs
        self.execution.current_step_id = None
        self.execution.ended_at = tz.now()
        self.execution.save(
            update_fields=['status', 'logs', 'current_step_id', 'ended_at']
        )
        logger.info(
            f"Execution {self.execution.id} completed in {iteration} step(s)."
        )

    def _execute_step(self, step) -> tuple:
        started_at = tz.now()
        rules = list(step.rules.order_by('priority'))
        evaluated_rules = []
        next_step_id = None
        step_status = 'completed'
        error_message = None
        approver_id = None

        if step.step_type == 'approval':
            approver_id = step.metadata.get('assignee_email', 'auto-approved')
            logger.info(f"[APPROVAL] '{step.name}' assigned to {approver_id}")
        elif step.step_type == 'notification':
            channel = step.metadata.get('notification_channel', 'email')
            logger.info(f"[NOTIFICATION] '{step.name}' via {channel}")
        elif step.step_type == 'task':
            logger.info(f"[TASK] '{step.name}'")

        # If step has NO rules → end workflow naturally
        if not rules:
            logger.info(f"Step '{step.name}' has no rules — ending workflow.")
            ended_at = tz.now()
            log = {
                'step_id': str(step.id),
                'step_name': step.name,
                'step_type': step.step_type,
                'evaluated_rules': [],
                'selected_next_step': None,
                'status': 'completed',
                'approver_id': approver_id,
                'error_message': None,
                'started_at': started_at.isoformat(),
                'ended_at': ended_at.isoformat(),
                'duration_seconds': round(
                    (ended_at - started_at).total_seconds(), 4
                ),
            }
            return log, None

        # Evaluate rules in priority order
        matched = False
        for rule in rules:
            result, error = evaluate_condition(rule.condition, self.data)
            evaluated_rules.append({
                'rule_id': str(rule.id),
                'rule': rule.condition,
                'result': result,
                'error': error,
            })

            if error:
                step_status = 'failed'
                error_message = f"Rule evaluation error: {error}"
                break

            if result:
                next_step_id = (
                    str(rule.next_step_id) if rule.next_step_id else None
                )
                matched = True
                break

        # No rule matched and no DEFAULT
        if step_status != 'failed' and not matched:
            step_status = 'failed'
            error_message = (
                "No matching rule found and no DEFAULT rule defined."
            )

        ended_at = tz.now()
        log = {
            'step_id': str(step.id),
            'step_name': step.name,
            'step_type': step.step_type,
            'evaluated_rules': evaluated_rules,
            'selected_next_step': next_step_id,
            'status': step_status,
            'approver_id': approver_id,
            'error_message': error_message,
            'started_at': started_at.isoformat(),
            'ended_at': ended_at.isoformat(),
            'duration_seconds': round(
                (ended_at - started_at).total_seconds(), 4
            ),
        }

        return log, (next_step_id if step_status == 'completed' else None)

    def _fail(self, message: str, logs: list = None):
        self.execution.status = 'failed'
        self.execution.logs = logs or []
        self.execution.ended_at = tz.now()
        self.execution.save(update_fields=['status', 'logs', 'ended_at'])
        logger.error(
            f"Execution {self.execution.id} failed: {message}"
        )