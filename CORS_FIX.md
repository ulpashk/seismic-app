# 🔴 КРИТИЧНАЯ ПРОБЛЕМА: CORS

## TL;DR

**Карта и таблицы пустые, потому что:**

1. 🔴 **CORS не настроен** - браузер блокирует ВСЕ запросы
2. ❌ **JSON API не существует** - таблицы не могут получить данные

## Что происходит сейчас

### Ошибка в консоли браузера:

```
Access to fetch at 'https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk-tile/11/1461/750.pbf?measure_category=demolition'
from origin 'http://localhost:3000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Результат:

- ❌ Карта ПУСТАЯ (тайлы существуют, но блокируются CORS)
- ❌ Таблицы ПУСТЫЕ (JSON API не существует + CORS блокирует)
- ❌ 502 Bad Gateway на `/building-risk`

## 🚨 СРОЧНОЕ РЕШЕНИЕ

### 1. Настроить CORS (5 минут)

Добавить к ответам сервера:

**Для Nginx:**

```nginx
location /api/v1/address/clickhouse/ {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type';

    # Остальная конфигурация...
}
```

**Для Express/Node.js:**

```javascript
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
```

**Для FastAPI/Python:**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["Content-Type"],
)
```

### 2. Создать JSON API (опционально, для таблиц)

```http
GET /api/v1/address/clickhouse/building-risk?measure_category=demolition
```

**Ответ:**

```json
[
  {
    "id": 123,
    "address": "ул. Абая, 10",
    "district": "Алмалинский район",
    "sri": 0.15,
    "h": 0.85,
    "v": 0.72,
    "e": 0.68
  }
]
```

## Проверка

После настройки CORS, в консоли браузера должны исчезнуть ошибки:

```
✅ Building layers added for category: demolition
✅ Тайлы загружаются
✅ Карта показывает здания
```

## Подробности

См. файл `BACKEND_API_REQUIREMENTS.md` для полной спецификации API.
