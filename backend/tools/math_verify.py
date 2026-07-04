import ast
import operator

_OP_MAP = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv
}

def _eval_expr(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    elif isinstance(node, ast.BinOp):
        left = _eval_expr(node.left)
        right = _eval_expr(node.right)
        op_type = type(node.op)
        if op_type in _OP_MAP:
            return _OP_MAP[op_type](left, right)
        else:
            raise ValueError(f"Unsupported operator: {op_type}")
    elif isinstance(node, ast.Expr):
        return _eval_expr(node.value)
    else:
        raise ValueError(f"Unsupported expression node: {type(node)}")

def verify(expr: str, claimed_value: float = None) -> dict:
    """
    Evaluates a simple arithmetic expression safely.
    Checks if it's within Professor Pi's scope (addition, subtraction, mult <= 5x5).
    """
    try:
        # Strip equals and right side if someone passed "2+2=5"
        if "=" in expr:
            parts = expr.split("=")
            expr = parts[0].strip()
            if claimed_value is None and parts[1].strip().replace('.', '', 1).isdigit():
                claimed_value = float(parts[1].strip())

        node = ast.parse(expr, mode='eval')
        actual_value = _eval_expr(node.body)
        
        # Scope: Multiplication up to 5x5. No division.
        in_scope = True
        has_mult = '*' in expr
        has_div = '/' in expr
        if has_div:
            in_scope = False
        
        if has_mult:
            nums = [n for n in ast.walk(node) if isinstance(n, ast.Constant)]
            for n in nums:
                if n.value > 5:
                    in_scope = False

        matches = True
        if claimed_value is not None:
            matches = (abs(actual_value - claimed_value) < 1e-9)

        return {
            "ok": True,
            "value": actual_value,
            "matches_claim": matches,
            "in_scope": in_scope
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e),
            "in_scope": False
        }
