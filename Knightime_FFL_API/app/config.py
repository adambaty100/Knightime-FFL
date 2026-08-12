import os


LOCAL_CORS_ORIGINS = (
    "http://localhost:4200",
    "http://127.0.0.1:4200",
)
VERCEL_PREVIEW_ORIGIN_REGEX = r"https://[a-z0-9-]+\.vercel\.app"


def configured_cors_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "")
    origins = [*LOCAL_CORS_ORIGINS]
    origins.extend(
        origin.strip().rstrip("/")
        for origin in configured.split(",")
        if origin.strip()
    )
    return list(dict.fromkeys(origins))


def configured_cors_origin_regex() -> str:
    return os.getenv("CORS_ORIGIN_REGEX", VERCEL_PREVIEW_ORIGIN_REGEX)
