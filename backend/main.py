# backend/main.py
from typing import List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from executor import run_cell_code

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://10.255.255.254:3000",
    "http://172.24.55.24:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 必要に応じて調整
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExecuteRequest(BaseModel):
    code: str
    parent_context_ids: Optional[List[str]] = None  # 複数の上流セルの context_id を受け取る

@app.post("/api/execute")
async def execute_cell(request: ExecuteRequest):
    output, new_context_id, defined_vars = run_cell_code(request.code, request.parent_context_ids)
    return {
        "output": output,
        "context_id": new_context_id,
        "defined_vars": defined_vars
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
