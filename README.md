EventFlow
Веб-приложение для управления мероприятиями с ролевой системой доступа. Позволяет организаторам создавать события, участникам — регистрироваться на них, а администраторам — управлять пользователями и контентом.

Стек технологий
React 18 — UI-библиотека
React Router DOM v6 — маршрутизация
Vite — сборщик и dev-сервер
Axios — HTTP-клиент (JSONPlaceholder для seed-данных)
localStorage — хранилище данных (события, пользователи, регистрации)
Быстрый старт
bash
# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev

# Сборка для продакшена
npm run build
Структура проекта
src/
├── components/         # Переиспользуемые компоненты
│   ├── EventCard.jsx   # Карточка мероприятия
│   ├── EventForm.jsx   # Форма создания/редактирования события
│   ├── Sidebar.jsx     # Боковая навигация
│   ├── Topbar.jsx      # Верхняя панель
│   └── ui.jsx          # Базовые UI-компоненты
├── context/
│   └── index.jsx       # AuthContext, ToastContext, ThemeContext
├── hooks/
│   └── index.js        # useRole, useForm, useDebounce и др.
├── layouts/
│   └── AppLayout.jsx   # Общий layout приложения
├── pages/              # Страницы
│   ├── HomePage.jsx
│   ├── DashboardPage.jsx
│   ├── EventsPage.jsx
│   ├── EventDetailPage.jsx
│   ├── CreateEventPage.jsx
│   ├── EditEventPage.jsx
│   ├── MyEventsPage.jsx
│   ├── ProfilePage.jsx
│   ├── AdminPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── NotFoundPage.jsx
├── routes/
│   ├── AppRouter.jsx       # Конфигурация маршрутов
│   ├── ProtectedRoute.jsx  # Защита маршрутов (требует авторизации)
│   └── RoleRoute.jsx       # Защита по роли
├── services/
│   └── api.js          # eventsService, registrationsService, authService
└── utils/
    └── index.js        # Вспомогательные утилиты
Ролевая система
В приложении реализовано шесть ролей. Роль назначается при регистрации и может быть изменена администратором.

Роль	Просмотр	Создание	Редактирование	Удаление	Регистрация	Статистика	Управление пользователями
Admin	✓	✓	✓	✓	—	✓	✓
Organizer	✓	✓	✓	✓	—	✓	—
Venue Manager	✓	—	✓	—	—	✓	—
Attendee	✓	—	—	—	✓	—	—
Sponsor	✓	—	—	—	—	—	—
Press	✓	—	—	—	—	—	—
Закрытые маршруты
/events/create — только Organizer и Admin
/events/:id/edit — Organizer, Admin, Venue Manager
/admin — только Admin
Функциональность
Мероприятия

Список с поиском, фильтрацией по категории и статусу, сортировкой и пагинацией
Страница детали события с возможностью регистрации/отмены
Создание и редактирование события (для Organizer / Admin)
Удаление событий (для Organizer / Admin)
8 категорий: conference, concert, workshop, meetup, webinar, festival, sports, exhibition
Статусы: upcoming, ongoing, completed, cancelled
Пользователи

Регистрация с выбором роли
Вход / выход
Личный профиль с историей регистраций
Страница «Мои события» — события, которые создал пользователь
Панель администратора

Просмотр всех пользователей
Смена роли пользователя
Удаление пользователей
Прочее

Светлая и тёмная тема
Toast-уведомления
Seed-данные генерируются при первом запуске из JSONPlaceholder API и сохраняются в localStorage
Хранилище данных
Все данные хранятся в localStorage. При первом открытии приложение загружает 24 события и 8 пользователей через JSONPlaceholder API.

Ключ	Содержимое
ef_events	Список событий
ef_registrations	Регистрации
ef_users	Пользователи
ef_user	Текущий пользователь
ef_token	JWT-подобный токен
ef_theme	Тема (light/dark)
Деплой
Проект настроен для деплоя на Netlify и Vercel (конфиги netlify.toml и vercel.json включены).

bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod
Примечание: приложение использует localStorage в качестве базы данных, поэтому данные хранятся только в браузере пользователя и не синхронизируются между устройствами.


