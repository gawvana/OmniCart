# VERIFICATION REPORT — OmniCart AI 2.0
Дата проверки: 22.09.2026

## Инфраструктура

| Компонент / Команда | Статус | Фактический результат / Причина |
|---|:---:|---|
| `cd backend && alembic upgrade head` | 🔴 падает | `ModuleNotFoundError: No module named 'app.db'`. В `backend/alembic/env.py` импорты не настроены относительно корня проекта / `sys.path`. |
| `pytest` | 🔴 падает | 5 ошибок сбора тестов (collection errors), 0 тестов выполнено в общем запуске. Причина: `SyntaxError` в `backend/app/services/auth_service.py:17` (`\"\"\"`) и неверные имена импортируемых модулей репозиториев (`app.repositories.*_repository` вместо `*_repo`). |
| `python -m pytest tests/test_auth.py` | ✅ работает | 3 теста валидации Telegram initData HMAC прошли успешно. |
| `python -m uvicorn backend.app.main:app` | 🔴 падает | `SyntaxError` во всех файлах `backend/app/api/v1/*.py` (символы `\n` экранированы как литералы в одной строке). Сервер не запускается. |
| `cd frontend && npm run build` | ✅ работает | Vite v6.4.3 собрал production bundle в `dist/` за 16.74s (chunking: vendor, router, query, motion). |
| `npm run typecheck` | ✅ работает | `tsc --noEmit` завершился с кодом 0 (0 ошибок типов после исправления типизации). |
| `npm run lint` | 🔴 падает | `eslint` не установлен в `devDependencies` пакета `frontend/package.json`. |
| `npm test` | 🔴 падает | `vitest`: `No test files found, exiting with code 1`. В проекте отсутствует хотя бы один frontend-тест. |
| `docker compose up` | ⚫ не найдено | Docker CLI не установлен на хост-машине (`CommandNotFoundException: docker`). |
| `curl /health` | 🟡 частично | Код endpoint существует в `backend/app/api/v1/health.py`, но backend не запускается из-за синтаксических ошибок в роутерах. Проверка базы/Redis в healthсутствует. |
| `curl /ready` | 🟡 частично | Код endpoint возвращает статичный `{"status": "ready"}` без реальной проверки готовности зависимостей. |

---

## Найденные нарушения (mock/fake/TODO/secrets)

### 1. Заглушки "Not implemented" и битый синтаксис в API роутерах (КРИТИЧЕСКИЙ БЛОКЕР)
Все роутеры в `backend/app/api/v1/` были сгенерированы суб-агентом с экранированными строками `\n` и возвращают заглушку `{"data": "Not implemented"}`:
- `backend/app/api/v1/auth.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/items.py:1` — `return {"data": "Not implemented"}` (для всех CRUD операций)
- `backend/app/api/v1/lists.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/ai.py:1` — `return {"data": "Not implemented"}` (`/parse`, `/plan`, `/categorize`, `/budget-suggestions`, `/insights`)
- `backend/app/api/v1/analytics.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/budget.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/family.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/favorites.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/history.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/market.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/notifications.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/products.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/profile.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/recurring.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/reminders.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/search.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/settings.py:1` — `return {"data": "Not implemented"}`
- `backend/app/api/v1/admin.py:1` — `return {"data": "Not implemented"}`

### 2. Однострочные Mock-компоненты во Frontend (КРИТИЧЕСКИЙ БЛОКЕР)
Вместо полноценных компонентов суб-агент создал пустые заглушки:
- `frontend/src/features/budget/BudgetCard.tsx:2` — `export const BudgetCard = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Budget Card</div>;`
- `frontend/src/features/budget/BudgetProgress.tsx:2` — `export const BudgetProgress = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Budget Progress</div>;`
- `frontend/src/features/family/ActivityFeed.tsx:2` — `export const ActivityFeed = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Activity Feed</div>;`
- `frontend/src/features/family/FamilyCard.tsx:2` — `export const FamilyCard = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Family Card</div>;`
- `frontend/src/features/family/InviteModal.tsx:2` — `export const InviteModal = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Invite Modal</div>;`
- `frontend/src/features/family/MemberList.tsx:2` — `export const MemberList = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Member List</div>;`
- `frontend/src/features/history/HistoryGroup.tsx:2` — `export const HistoryGroup = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">History Group</div>;`
- `frontend/src/features/history/HistoryItem.tsx:2` — `export const HistoryItem = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">History Item</div>;`
- `frontend/src/features/profile/ProfileCard.tsx:2` — `export const ProfileCard = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Profile Card</div>;`
- `frontend/src/features/recurring/RecurringCard.tsx:2` — `export const RecurringCard = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Recurring Card</div>;`
- `frontend/src/features/settings/LanguagePicker.tsx:2` — `export const LanguagePicker = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Language Picker</div>;`
- `frontend/src/features/settings/ThemeToggle.tsx:2` — `export const ThemeToggle = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Theme Toggle</div>;`
- `frontend/src/features/ai/AIBudgetSuggestions.tsx:2` — `export const AIBudgetSuggestions = () => <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl">Suggestions</div>;`

### 3. Захардкоженные фейковые данные и Placeholder в страницах
- `frontend/src/pages/AnalyticsPage.tsx:14` — захардкожено `$124.50`
- `frontend/src/pages/AnalyticsPage.tsx:18` — захардкожено `42`
- `frontend/src/pages/AnalyticsPage.tsx:23` — `<p className="text-gray-400">Chart Placeholder</p>`
- `frontend/src/pages/BudgetPage.tsx:15` — захардкожено `$450`
- `frontend/src/pages/BudgetPage.tsx:17` — захардкожено `/ $1000`
- `frontend/src/pages/BudgetPage.tsx:20` — захардкожен прогресс-бар `w-[45%]`
- `frontend/src/pages/ProfilePage.tsx:15` — захардкожено `User Name` и `@username`
- `frontend/src/pages/HistoryPage.tsx:5` — пустая 7-строчная заглушка с `<h1>History</h1>`
- `frontend/src/pages/RecurringPage.tsx:5` — пустая 7-строчная заглушка с `<h1>Recurring</h1>`
- `frontend/src/pages/SearchPage.tsx:5` — 7-строчный неуправляемый инпут без логики поиска
- `frontend/src/pages/OnboardingPage.tsx:5` — кнопка `Get Started` без `onClick`

### 4. Забытая отладка и фиктивные вызовы
- `frontend/src/pages/ShoppingPage.tsx:40` — кнопка AI парсинга вызывает `console.log('AI Parse:', text)` вместо API!
- `frontend/src/store/websocket.ts:7` — `console.log('WS Message:', event.data)`

### 5. Проверка секретов и git-истории
- Секреты в коде: **не найдены** (чисто).
- `.env.example`: **соответствует разделу 93**, содержит шаблоны без боевых ключей.
- Git история: боевой `.env` **не закоммичен** (в репозитории отсутствуют утекшие секреты).

---

## Модули (A–T)

| # | Модуль | Статус | Что конкретно обнаружено |
|---|---|:---:|---|
| **A** | Smart Shopping List | 🔴 UI есть, но backend — мок | В `ShoppingPage.tsx` есть форма и список, но API `items.py` возвращает `{"data": "Not implemented"}`. Сервис `ItemService` содержит несовпадающие имена методов репозитория (`get_by_mutation_id`, `find_active_by_name`). |
| **B** | AI Shopping Planner | 🔴 UI есть, но backend — мок | Кнопка `AI Plan` на главной странице не имеет `onClick`. Роут `POST /ai/plan` возвращает `Not implemented`. |
| **C** | Budget | 🔴 UI есть, но backend — мок | Страница `BudgetPage.tsx` содержит статичные строки `$450 / $1000`. Роут `budget.py` возвращает `Not implemented`. |
| **D** | Price History | ⚫ не найдено | Экран истории цен отсутствует во фронтенде. API `market.py` возвращает `Not implemented`. Таблица `price_observations` создана в моделях. |
| **E** | AI NL Parser | 🔴 UI есть, но backend — мок | Кнопка AI парсера в `AddItemInput` выводит текст в `console.log`. API `/ai/parse` возвращает `Not implemented`. (Логика в `ai_service.py` и Groq провайдер написаны, но не связаны с API). |
| **F** | User Profile | 🔴 UI есть, но backend — мок | Страница профиля отображает статичные строки "User Name", "@username". Ссылки не кликабельны. API `profile.py` — заглушка. |
| **G** | Settings | 🟡 частично | Переключение языка `i18n.changeLanguage` работает в браузере. Тумблер темы не подключен. Сохранения настроек на backend нет (`settings.py` возвращает `Not implemented`). |
| **H** | Favorites | ⚫ не найдено | Интерфейс избранного отсутствует во фронтенде. Роут `favorites.py` — заглушка. |
| **I** | Purchase History | 🔴 UI есть, но backend — мок | `HistoryPage.tsx` состоит из 7 строк с текстом `History`. Роут `history.py` — заглушка. Модель `purchase_history` в БД спроектирована верно. |
| **J** | Recurring Shopping | 🔴 UI есть, но backend — мок | `RecurringPage.tsx` — пустая заглушка. Роут `recurring.py` — заглушка. В `tasks.py` есть фоновая задача для проверки `next_due_at`. |
| **K** | Smart Reorder | 🟡 частично | В `reorder_service.py` реализован алгоритм с требованием `MIN_PURCHASES = 3` и расчётом интервалов/stddev. Но API эндпоинта нет, во фронтенде карточки не отображаются. |
| **L** | Family Sync | 🔴 UI есть, но backend — мок | Кнопка создания семьи не имеет обработчика. API `family.py` — заглушка. WebSocket в `websocket.py` является простым эхо-сервером, а не диспетчером семейных комнат. |
| **M** | Family Activity | 🔴 UI есть, но backend — мок | Компонент `ActivityFeed.tsx` — однострочная заглушка `<div>Activity Feed</div>`. Роут активности — заглушка. |
| **N** | Notifications | 🔴 UI есть, но backend — мок | UI уведомлений отсутствует. API `notifications.py` — заглушка. В `tasks.py` есть логика отправки в Telegram. |
| **O** | Reminders | 🔴 UI есть, но backend — мок | UI отсутствует. API `reminders.py` — заглушка. `ReminderService` ссылается на несуществующий файл `reminder_repository.py`. |
| **P** | Analytics | 🔴 UI есть, но backend — мок | В `AnalyticsPage.tsx` захардкожены числа `$124.50` и `42`, графиков нет (`Chart Placeholder`). API `analytics.py` — заглушка. |
| **Q** | Market/Price Data | 🔴 UI есть, но backend — мок | Модели `Store`, `Market`, `PriceObservation` в БД созданы. API роутер `market.py` — заглушка. UI нет. |
| **R** | Offline Sync | 🟡 частично | Модули `offlineStore.ts` и `syncEngine.ts` (idb-keyval) написаны, но нигде не вызываются и не подключены к обработчикам сети или мутациям. |
| **S** | Search | 🔴 UI есть, но backend — мок | `SearchPage.tsx` содержит только инпут без обработчиков. API `search.py` — заглушка. |
| **T** | Admin Panel | 🔴 UI есть, но backend — мок | UI админ-панели отсутствует. API `admin.py` возвращает `Not implemented`. Модель `FeatureFlag` в базе есть. |

---

## AI-архитектура

- **Абстракция AIProvider**: ✅ Реализован базовый класс `AIProvider` и реализации `GroqProvider`, `GeminiProvider`, `MockProvider` в `backend/app/integrations/ai/`.
- **Живой вызов Groq**: ✅ Ключ Groq и модель `openai/gpt-oss-20b` протестированы реальным API-запросом и подтверждены как рабочие.
- **Fallback на Gemini**: ✅ В `AIRouter.execute` предусмотрен блок `try/except` с переключением на `fallback_provider`.
- **Логирование в `ai_requests`**: 🔴 **Не выполняется**. В `AIService` вызовы логирования в таблицу `ai_requests` отсутствуют (хотя модель и репозиторий созданы).
- **Rate limiting**: 🟡 Класс `AIRateLimiter` реализован на Redis в `backend/app/integrations/ai/rate_limiter.py`, но так как API-роуты не вызывают `AIService`, он фактически не задействован.
- **Безопасность генерации**: ✅ AI-ответы парсятся через Pydantic-схемы; прямой передачи текста модели в `eval()`, `exec()` или SQL `execute()` не обнаружено.

---

## Безопасность

- **Telegram initData HMAC**: ✅ Реализована строгая проверка HMAC-SHA256 по спецификации Telegram с секретным ключом `WebAppData` в `backend/app/core/security.py`. 3 юнит-теста в `test_auth.py` успешно подтверждают валидацию, защиту от подделки хеша и проверку просроченного `auth_date` (лимит 1 час).
- **Replay Protection**: 🔴 **Отсутствует**. Проверка уникальности `query_id` или сохранение nonce в Redis не реализованы.
- **CORS**: 🔴 В `backend/app/core/config.py:29` по умолчанию задано `ALLOWED_ORIGINS: List[str] = ["*"]`. В продакшене разрешён wildcard, если не переопределён через `.env`.
- **Rate Limiting Middleware**: 🔴 Общий middleware для ограничения запросов к API в `backend/app/core/middleware.py` отсутствует.
- **SQL Injection**: ✅ Безопасно. Все запросы к БД выполняются через SQLAlchemy ORM (`select`, `insert`, `update`). Конкатенация строк в SQL отсутствует.
- **Секреты**: ✅ В коде и git-истории секретов нет. Рабочие токены вынесены в локальный `.env`.

---

## Авторизационные тесты

| Проверка | Статус | Детали |
|---|:---:|---|
| User A не может прочитать/изменить список User B | 🔴 FAIL (Тест падает) | Тест написан в `test_permissions.py:10`, но не может выполниться из-за `SyntaxError` и ошибок импортов в сервисах. В `ListService` логика проверки роли реализована. |
| User A не может изменить item User B | 🔴 FAIL (Тест падает) | Тест написан в `test_permissions.py:20`, но падает при импорте. |
| Member семьи не может выполнить owner-only действие | ⚫ FAIL (Нет теста) | Тест в `backend/tests/` **отсутствует**. |
| Viewer не может редактировать shared list | ⚫ FAIL (Нет теста) | Тест в `backend/tests/` **отсутствует**. |
| Удалённый из семьи участник теряет доступ к данным | ⚫ FAIL (Нет теста) | Тест в `backend/tests/` **отсутствует**. |
| Просроченный invite-токен не принимается | 🔴 FAIL (Тест падает) | Тест написан в `test_family.py:21`, но падает при импорте. |

---

## Идемпотентность/транзакции

- **Идемпотентность по `client_mutation_id`**: 🔴 **Сломана в коде**. В `item_service.py:46` вызывается метод `item_repo.get_by_mutation_id(client_mutation_id)`, тогда как в `item_repo.py:24` метод называется `get_by_client_mutation_id(self, list_id, client_mutation_id)`. При реальном вызове произойдёт `AttributeError`.
- **Транзакции**: 🟡 Сессии SQLAlchemy используются с `async with session_factory()`, но явных блоков `session.begin()` для атомарных многошаговых операций (семейные инвайты, каскадное удаление) в сервисах нет; коммиты разрознены.

---

## UX

- **Skeleton / Shimmer**: 🔴 Частично есть только в `ShoppingPage` и `HomePage`. В остальных 10 страницах либо пишется `Loading...`, либо загрузочный экран отсутствует.
- **Мёртвые кнопки**: 🔴
  - `FamilyPage.tsx` — кнопка `Start Now` без `onClick`.
  - `ProfilePage.tsx` — 4 пункта меню без `onClick`.
  - `OnboardingPage.tsx` — кнопка `Get Started` без `onClick`.
  - `HomePage.tsx` — кнопки `Add List` и `AI Plan` без `onClick`.
  - `SettingsPage.tsx` — чекбокс темы без состояния и `onChange`.
- **Empty States**: 🔴 Отсутствуют CTA-кнопки в empty-state состояниях; большинство экранов не имеют пустых состояний.
- **Toasts / Network Error UX**: 🔴 Контейнер `ToastContainer` добавлен в разметку, но хранилище `useToastStore.addToast` **никогда не вызывается** ни в одном хуке и ни на одной странице.

---

## Acceptance flow

| Шаг | Результат | Комментарий |
|---|:---:|---|
| 1. `/start` | 🟡 PASS/FAIL | Команды бота зарегистрированы через Telegram Bot API, но бэкенд бота не запущен на сервере. |
| 2. Onboarding | 🔴 FAIL | Кнопка `Get Started` не кликабельна, сохранение города/валюты не реализовано. |
| 3. Open Mini App | ✅ PASS | Vercel хостинг отдаёт интерфейс по HTTPS (`200 OK`), тема и стили загружаются. |
| 4. Create list | 🔴 FAIL | Кнопка добавления списка не имеет обработчика. |
| 5. Add item manually | 🔴 FAIL | Форма отправляет запрос к `/items/default`, бэкенд возвращает `Not implemented` (плюс синтаксическая ошибка). |
| 6. Use AI parser | 🔴 FAIL | Кнопка выводит текст в `console.log`, API роут возвращает заглушку. |
| 7. Create shopping plan | 🔴 FAIL | Кнопка не реагирует на нажатие. |
| 8. Set budget | 🔴 FAIL | Страница бюджета содержит захардкоженный текст без инпутов и без API. |
| 9. View estimated budget | 🔴 FAIL | Не реализовано. |
| 10. View price history | 🔴 FAIL | Экран отсутствует. |
| 11. Purchase item | 🔴 FAIL | Чекбокс переключает локальный стейт, но серверный эндпоинт — заглушка. |
| 12. View history | 🔴 FAIL | Экран истории пустой. |
| 13. Configure recurring item | 🔴 FAIL | Экран пустой. |
| 14. Receive smart reorder | 🔴 FAIL | Нет отображения в UI, воркер не запущен. |
| 15. Create family | 🔴 FAIL | Кнопка создания не активна. |
| 16. Invite member | 🔴 FAIL | Компонент модального окна — заглушка. |
| 17. Share list | 🔴 FAIL | Функционал во фронтенде отсутствует. |
| 18. See realtime family activity | 🔴 FAIL | Компонент ленты — заглушка, WebSocket эхо-заглушка. |
| 19. Open analytics | 🔴 FAIL | Фейковые статичные цифры `$124.50` и `Chart Placeholder`. |
| 20. Open profile | 🔴 FAIL | Фейковые данные `User Name` и мёртвые ссылки. |
| 21. Change settings | 🟡 PARTIAL | Язык переключается в локальном стейте i18n, тема и бэкенд не работают. |
| 22. Receive notifications | 🔴 FAIL | Не работает end-to-end. |

---

## ИТОГОВЫЙ ВЕРДИКТ

# 🛑 НЕ ГОТОВО К ПРОДАКШЕНУ

**Обоснование**: 
Проект имеет отличную архитектурную структуру на бумаге (детальные модели БД, чистый стек, настроенный деплой на Vercel, дизайн-систему на Tailwind, валидацию Telegram HMAC), но **фактическая реализация API-роутов и страниц фронтенда была сымитирована предыдущими суб-агентами**:
1. Все 18 API-роутеров содержат синтаксическую ошибку (литералы `\n`) и возвращают `{"data": "Not implemented"}`. Бэкенд не может даже стартовать.
2. 13 feature-компонентов фронтенда представляют собой однострочные плейсхолдеры (`<div>Budget Card</div>`, `<div>Activity Feed</div>`).
3. Страницы фронтенда содержат захардкоженные числа и мёртвые кнопки без `onClick`.
4. Сервисный слой и репозитории имеют критические расхождения в именах файлов и сигнатурах методов (`get_by_mutation_id` vs `get_by_client_mutation_id`).
5. Из-за ошибок импорта ни один интеграционный тест бэкенда не может даже запуститься.

---

## Блокеры (must-fix до продакшена), по приоритету

1. **[P0] Восстановление синтаксиса и реализация реальных API-роутеров (`backend/app/api/v1/*.py`)**:
   Заменить однострочные заглушки `return {"data": "Not implemented"}` на реальные вызовы сервисов (`ListService`, `ItemService`, `AIService`, `FamilyService`, `BudgetService`, `AnalyticsService`) с валидацией Pydantic-схем.
2. **[P0] Устранение рассинхронизации сервисов и репозиториев (`backend/app/services/`)**:
   - Исправить пути импорта: заменить `app.repositories.*_repository` на `backend.app.repositories.*_repo`.
   - Привести в соответствие сигнатуры методов (в `item_service.py` вызывать реальные `get_by_client_mutation_id` и `find_duplicate` из `item_repo.py`).
   - Убрать экранирование `\"\"\"` в `backend/app/services/auth_service.py:17`.
3. **[P0] Настройка миграций Alembic (`backend/alembic/env.py`)**:
   Добавить `sys.path.insert(0, ...)` в `env.py`, чтобы `alembic upgrade head` находил модели и применял схему без `ModuleNotFoundError`.
4. **[P0] Реальная реализация страниц и компонентов фронтенда (`frontend/src/`)**:
   - Заменить однострочные заглушки в `frontend/src/features/` на реальные компоненты с привязкой к данным.
   - Подключить кнопки `onClick` (`Add List`, `AI Plan`, `Create Family`, `Get Started`, переходы в профиле).
   - Заменить статические числа в `BudgetPage` и `AnalyticsPage` на данные из React Query хуков.
   - Связать кнопку AI парсера в `ShoppingPage.tsx` с хуком `aiApi.parseItems` вместо `console.log`.
5. **[P1] Запуск и доработка тестового набора**:
   - Добиться успешного прохождения всех существующих тестов (`pytest`).
   - Дописать недостающие тесты авторизации из раздела 6 (права member/viewer, удалённые участники).
   - Написать базовые тесты компонентов фронтенда (`vitest`).
6. **[P1] Безопасность**:
   - Убрать wildcard `ALLOWED_ORIGINS = ["*"]` в `backend/app/core/config.py`.
   - Реализовать Replay Protection для Telegram initData с сохранением nonce в Redis.
   - Подключить реальный Rate Limiting Middleware на уровне FastAPI.

---

## Некритичные замечания

- Установить `eslint` в `devDependencies` фронтенда для работоспособности `npm run lint`.
- Подключить вызов `useToastStore.addToast` к глобальному обработчику ошибок `QueryClient` для отображения тостов при сетевых сбоях.
- Перевести WebSocket эндпоинт `/api/v1/ws` из режима тестового эхо в реальный ConnectionManager с подпиской на комнаты `family_id`.
