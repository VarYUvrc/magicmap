import uuid
import io
import contextlib
from session_manager import get_context, update_context

def run_cell_code(code: str, parent_context_id: str = None):
    # 上流セルの環境（変数）を取得（なければ空の辞書）
    if parent_context_id:
        # 上流の環境は変更されないようにコピーする
        env = get_context(parent_context_id).copy()
    else:
        env = {}

    # 出力をキャプチャするために StringIO を利用
    stdout = io.StringIO()
    try:
        with contextlib.redirect_stdout(stdout):
            # セルのコードを実行
            exec(code, env)
    except Exception as e:
        # エラーが発生した場合は例外内容を出力
        output = f"Error: {str(e)}"
    else:
        output = stdout.getvalue()
    finally:
        stdout.close()

    # このセルの実行後の環境（env）を保存するため、新しい context_id を発行
    new_context_id = str(uuid.uuid4())
    update_context(new_context_id, env)

    return output, new_context_id
