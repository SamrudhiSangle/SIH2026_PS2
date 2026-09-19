from fastapi import APIRouter, Request

router = APIRouter(prefix="/api")


@router.get("/models")
async def list_models(request: Request):
    manager = request.app.state.model_manager
    return {"models": manager.list_models()}
