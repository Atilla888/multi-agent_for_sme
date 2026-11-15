---
title: "UX и дизайн"
updated: 2026-11-15
status: snapshot
tags: ["retail-ops", "design"]
---

# UX и дизайн

## Фазы (все завершены)

| Фаза | Итог |
|---|---|
| 2A | Анализ конкурентов: SleekFlow, Sintra AI — основные; aspanCRM, CareHub, Senbi — казахстанские; respond.io, HighLevel, Vendasta — вторичные |
| 2B | Проверка UML и master-документа → UX: 5 акторов, 15 семейств экранов, матрица из 39 строк |
| 2C | IA: шесть областей — Overview, Conversations, Business, Knowledge, Analytics, Administration |
| 2D | Десять сквозных пользовательских потоков, 85 ветвей |
| 2E | Итоговый инвентарь экранов, 29 общих компонентов, приоритеты P0 / P1 / P2 |
| 3A–3B | Low-fi вайрфреймы шести P0-областей и UX-ревью |
| 3C | Дизайн-система **Calm Operational SaaS**, светлая тема, семантические токены |
| 3D | High-fi: общая оболочка + 6 P0-экранов |
| 3E | Интерактивный прототип, 8 сценариев |
| 3F | `docs/DESIGN.md` — итоговый контракт UX/UI для фронтенда |
| Lab 3 | Кликабельный адаптивный прототип: desktop, tablet, mobile, на mock-данных |
| Редизайн 15.11.2026 | Новый визуальный слой: folk (светлая) + Linear (тёмная), Geist, статусы иконкой и словами. Структура Lab 3 сохранена |

P0-экраны: Conversations, Escalations, Orders, Customer Web Chat, Analytics, Forecasts.

## Figma

| Файл | Ключ | Роль |
|---|---|---|
| [Diplom — Multi-Agent Platform UI (Lab 3)](https://www.figma.com/design/W6XefZbbmZq1YZltBfsry7) | `W6XefZbbmZq1YZltBfsry7` | Структура экранов, брейкпоинты и потоки. Визуальный стиль с 15.11.2026 — новый, см. [[02 Система/Фронтенд#Дизайн в коде]] |
| [Diplom — Multi-Agent Platform UX/UI](https://www.figma.com/design/OFXTN83nFl3RqukrEYQrFy) | `OFXTN83nFl3RqukrEYQrFy` | Ранние фазы: страницы 03A–03E |

## Правила, которые дизайн закрепил

- Подтверждённый эффект ≠ предложение модели ≠ доставка сообщения.
- Order State ≠ Reservation State; известная ошибка ≠ `OUTCOME_UNKNOWN`.
- Сплошная линия — исторический ACTUAL, пунктир — прогноз PREDICTED.
- Клиентский чат скрывает внутренние термины; кнопка **Retry message** повторяет только сообщение, но не заказ.
- Цель — уровень WCAG 2.2 AA (не сертификация), видимый фокус, смысл не только цветом, устойчивость к переносу текста на EN / RU / KZ.

## Источники

- [docs/DESIGN.md](https://github.com/Atilla888/multi-agent_for_sme/blob/main/docs/DESIGN.md) — §29 описывает Lab 3
- [docs/research/](https://github.com/Atilla888/multi-agent_for_sme/tree/main/docs/research) — отчёты фаз 2B–3E и анализ конкурентов
- [design/README.md](https://github.com/Atilla888/multi-agent_for_sme/blob/ffba5d2/design/README.md)

Связи: [[02 Система/Фронтенд]].
