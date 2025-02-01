# backend/session_manager.py

# 簡易なセッション管理（実運用では DB などを用いた管理が望ましい）
_contexts = {}

def get_context(context_id: str):
    return _contexts.get(context_id, {})

def update_context(context_id: str, context: dict):
    _contexts[context_id] = context
