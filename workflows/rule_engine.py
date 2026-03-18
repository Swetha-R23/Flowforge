"""
FlowForge Rule Engine
Evaluates step rules to determine next step in workflow execution.
Supports: ==, !=, <, >, <=, >=, &&, ||, contains(), startsWith(), endsWith(), DEFAULT
"""
import re
import logging

logger = logging.getLogger(__name__)

MAX_ITERATIONS = 50


def evaluate_condition(condition: str, data: dict) -> tuple:
    """
    Returns (result: bool, error: str | None)
    """
    condition = condition.strip()

    if condition.upper() == 'DEFAULT':
        return True, None

    try:
        expr = _transform(condition, data)
        result = bool(eval(expr, {"__builtins__": {}}, {}))
        return result, None
    except Exception as e:
        logger.error(f"Rule eval error — condition: {condition!r}, error: {e}")
        return False, str(e)


def _transform(condition: str, data: dict) -> str:
    expr = condition

    # Handle string functions: contains(), startsWith(), endsWith()
    def contains_r(m):
        fval = _fv(m.group(1), data)
        return f'("{m.group(2)}" in str({fval}))'

    def starts_r(m):
        fval = _fv(m.group(1), data)
        return f'str({fval}).startswith("{m.group(2)}")'

    def ends_r(m):
        fval = _fv(m.group(1), data)
        return f'str({fval}).endswith("{m.group(2)}")'

    expr = re.sub(r'contains\((\w+),\s*["\']([^"\']+)["\']\)', contains_r, expr)
    expr = re.sub(r'startsWith\((\w+),\s*["\']([^"\']+)["\']\)', starts_r, expr)
    expr = re.sub(r'endsWith\((\w+),\s*["\']([^"\']+)["\']\)', ends_r, expr)

    # Replace && / || with Python operators
    expr = expr.replace('&&', ' and ').replace('||', ' or ')

    # Tokenize and replace field references with actual values
    tokens = _tokenize(expr)
    SKIP = {'and', 'or', 'not', 'True', 'False', 'None', 'in', 'str'}
    parts = []
    for ttype, tval in tokens:
        if ttype == 'IDENT' and tval not in SKIP and tval in data:
            val = data[tval]
            if isinstance(val, str):
                parts.append(f'"{val}"')
            elif isinstance(val, bool):
                parts.append('True' if val else 'False')
            else:
                parts.append(str(val))
        else:
            parts.append(tval)

    return ''.join(parts)


def _fv(field: str, data: dict) -> str:
    """Resolve field value for use in expression."""
    if field in data:
        val = data[field]
        return f'"{val}"' if isinstance(val, str) else str(val)
    return f'"{field}"'


def _tokenize(expr: str) -> list:
    """Tokenize expression into (type, value) pairs."""
    tokens = []
    i = 0
    while i < len(expr):
        c = expr[i]
        if c in ('"', "'"):
            j = i + 1
            while j < len(expr) and expr[j] != c:
                if expr[j] == '\\':
                    j += 1
                j += 1
            tokens.append(('STRING', expr[i:j+1]))
            i = j + 1
        elif c.isalpha() or c == '_':
            j = i
            while j < len(expr) and (expr[j].isalnum() or expr[j] == '_'):
                j += 1
            tokens.append(('IDENT', expr[i:j]))
            i = j
        else:
            tokens.append(('OTHER', c))
            i += 1
    return tokens