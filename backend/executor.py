# backend/executor.py
import uuid
import io
import contextlib
from typing import List, Optional
from session_manager import get_context, update_context

def get_defined_variables(env: dict) -> dict:
    """実行環境から、ユーザーが定義した変数の一覧を抽出する"""
    # 組み込み関数や特殊変数を除外
    builtin_names = set(dir(__builtins__))
    # __name__ などの特殊変数も除外
    special_names = {name for name in env if name.startswith('__')}
    # ユーザーが定義した変数のみを抽出
    user_vars = {
        name: str(value)
        for name, value in env.items()
        if name not in builtin_names and name not in special_names
    }
    return user_vars

def run_cell_code(code: str, parent_context_ids: Optional[List[str]] = None):
    # 複数の上流セルの環境をすべてマージする（同じ変数名は後勝ち）
    env = {}
    if parent_context_ids:
        for cid in parent_context_ids:
            env.update(get_context(cid))
    
    # 出力キャプチャ用の StringIO を利用
    stdout = io.StringIO()
    try:
        with contextlib.redirect_stdout(stdout):
            exec(code, env)
    except Exception as e:
        output = f"Error: {str(e)}"
    else:
        output = stdout.getvalue()
    finally:
        stdout.close()

    # 新しい実行環境を保存するため、新たな context_id を発行
    new_context_id = str(uuid.uuid4())
    update_context(new_context_id, env)

    # 定義済み変数の一覧を取得
    defined_vars = get_defined_variables(env)

    return output, new_context_id, defined_vars
