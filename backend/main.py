from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from executor import run_cell_code

app = FastAPI()

# CORSの設定（必要に応じて許可するオリジンを調整してください）
origins = [
    "http://localhost:3000",
    "http://10.255.255.254:3000",
    "http://172.24.55.24:3000",
    # 必要なら他のオリジンも追加
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # または ["*"] として全て許可する
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExecuteRequest(BaseModel):
    code: str
    parent_context_id: Optional[str] = None

@app.post("/api/execute")
async def execute_cell(request: ExecuteRequest):
    output, new_context_id = run_cell_code(request.code, request.parent_context_id)
    return {"output": output, "context_id": new_context_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
