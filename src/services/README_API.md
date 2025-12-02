# API для рекомендаций по зданиям

## Эндпоинты

### PBF Тайлы (Vector Tiles) - основной источник данных

```text
GET https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk-tile/{z}/{x}/{y}.pbf
```

**Параметры:**

- `measure_category` - категория мер: `demolition`, `passportization`, `strengthening`
- `district` - название района (опционально, формат: "Алмалинский район")

**Примеры:**

```text
/building-risk-tile/12/2789/1483.pbf?measure_category=demolition
/building-risk-tile/12/2789/1483.pbf?measure_category=strengthening&district=Алмалинский район
```

### JSON API (альтернатива, если доступна)

```text
GET https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk
```

**Параметры:**

- `measure_category` - категория мер: `demolition`, `passportization`, `strengthening`
- `district` - название района (опционально)

## Структура ответа

API должен возвращать массив объектов со следующими полями:

```json
[
  {
    "id": 1,
    "building_id": "BLD001",
    "address": "ул. Абая, 10",
    "district": "Алмалинский район",
    "sri": 0.15,
    "h": 0.85,
    "v": 0.72,
    "e": 0.68
  },
  {
    "id": 2,
    "building_id": "BLD002",
    "address": "пр. Назарбаева, 45",
    "district": "Медеуский район",
    "sri": 0.42,
    "h": 0.58,
    "v": 0.51,
    "e": 0.45
  }
]
```

## Обязательные поля

| Поле          | Тип    | Описание                                            |
| ------------- | ------ | --------------------------------------------------- |
| `id`          | number | Уникальный идентификатор записи                     |
| `building_id` | string | ID здания в системе                                 |
| `address`     | string | Адрес здания                                        |
| `district`    | string | Район города                                        |
| `sri`         | number | Seismic Risk Index (индекс сейсмического риска) 0-1 |
| `h`           | number | Hazard - уровень опасности/геориск 0-1              |
| `v`           | number | Vulnerability - уязвимость здания 0-1               |
| `e`           | number | Exposure - экспозиция/масштаб потерь 0-1            |

## Примечания

- Все числовые индексы (sri, h, v, e) должны быть в диапазоне от 0 до 1
- `sri` - это итоговый индекс, рассчитанный по формуле: `SRI = 1 - (H × V × E)`
- Меньшее значение SRI означает больший риск
- API должен поддерживать фильтрацию по району
