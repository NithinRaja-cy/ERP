import redis
from app.core.config import settings

redis_client = redis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5,
    retry_on_timeout=True,
)


def get_cached(key: str) -> str | None:
    try:
        return redis_client.get(key)
    except Exception:
        return None


def set_cached(key: str, value: str, ttl: int = 300) -> None:
    try:
        redis_client.setex(key, ttl, value)
    except Exception:
        pass


def delete_cached(key: str) -> None:
    try:
        redis_client.delete(key)
    except Exception:
        pass


def delete_pattern(pattern: str) -> None:
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
    except Exception:
        pass
