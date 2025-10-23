# Проект системы учета компьютерной техники

## Описание проекта

Система для ведения учета компьютерной техники: серверов, рабочих станций, ноутбуков и другой номенклатуры. Позволяет отслеживать состав устройств, их характеристики, серийные номера, фотографии и другую информацию.

## Архитектура системы

### Технологический стек
- **Frontend**: React + TypeScript
- **Backend**: Node.js/Express + TypeScript
- **База данных**: PostgreSQL
- **Аутентификация**: JWT с локальной аутентификацией и хешированием паролей

### Структура проекта
```
mediannSP/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   └── config/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── public/
├── docs/
└── tests/
```

## Структура базы данных

### Основные таблицы:

1. **roles** - уровни доступа пользователей
   ```sql
   CREATE TABLE roles (
       id SERIAL PRIMARY KEY,
       name VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'writer', 'reader'
       description TEXT
   );
   ```

2. **users** - информация о пользователях
   ```sql
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(100) UNIQUE NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL, -- хешированный пароль
       role_id INTEGER REFERENCES roles(id),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **device_types** - типы устройств
   ```sql
   CREATE TABLE device_types (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100) UNIQUE NOT NULL, -- 'Сервер', 'Рабочая станция', 'Ноутбук'
       description TEXT
   );
   ```

4. **component_types** - типы комплектующих
   ```sql
   CREATE TABLE component_types (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100) UNIQUE NOT NULL, -- 'Материнская плата', 'Процессор', 'Оперативная память'
       description TEXT
   );
   ```

5. **devices** - устройства
   ```sql
   CREATE TABLE devices (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       serial_number VARCHAR(255) UNIQUE,
       device_type_id INTEGER REFERENCES device_types(id),
       manufacturer VARCHAR(255),
       model VARCHAR(255),
       specifications JSONB, -- JSON для хранения спецификаций
       location VARCHAR(255), -- где находится устройство
       purchase_date DATE,
       warranty_date DATE,
       status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'in_repair', 'disposed'
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       created_by INTEGER REFERENCES users(id),
       updated_by INTEGER REFERENCES users(id)
   );
   ```

6. **components** - комплектующие
   ```sql
   CREATE TABLE components (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       serial_number VARCHAR(255) UNIQUE,
       component_type_id INTEGER REFERENCES component_types(id),
       manufacturer VARCHAR(255),
       model VARCHAR(255),
       specifications JSONB, -- JSON для хранения спецификаций
       purchase_date DATE,
       warranty_date DATE,
       status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'in_repair', 'disposed'
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       created_by INTEGER REFERENCES users(id),
       updated_by INTEGER REFERENCES users(id)
   );
   ```

7. **device_components** - связь между устройствами и комплектующими
   ```sql
   CREATE TABLE device_components (
       id SERIAL PRIMARY KEY,
       device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
       component_id INTEGER REFERENCES components(id),
       installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       installed_by INTEGER REFERENCES users(id),
       is_active BOOLEAN DEFAULT TRUE, -- для отслеживания снятых комплектующих
       UNIQUE(device_id, component_id) -- одно комплектующее не может быть дважды в одном устройстве
   );
   ```

8. **photos** - фотографии устройств и комплектующих
   ```sql
   CREATE TABLE photos (
       id SERIAL PRIMARY KEY,
       entity_type VARCHAR(20) NOT NULL, -- 'device' или 'component'
       entity_id INTEGER NOT NULL, -- id устройства или комплектующего
       file_path VARCHAR(500), -- путь к файлу в файловой системе
       file_name VARCHAR(255), -- оригинальное имя файла
       file_size INTEGER, -- размер файла в байтах
       mime_type VARCHAR(100), -- тип файла
       is_primary BOOLEAN DEFAULT FALSE, -- главная фотография
       uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       uploaded_by INTEGER REFERENCES users(id),
       INDEX idx_entity (entity_type, entity_id)
   );
   ```

## REST API

### Аутентификация
```
POST /api/auth/login
- Вход в систему
- Тело запроса: { "username": "string", "password": "string" }
- Ответ: { "token": "JWT", "user": { "id", "username", "role" } }

POST /api/auth/logout
- Выход из системы
- Требует авторизации

POST /api/auth/refresh
- Обновление токена
- Требует refresh токена
```

### Управление пользователями (только для admin)
```
GET /api/users
- Получить список пользователей
- Параметры: page, limit, search

POST /api/users
- Создать нового пользователя
- Тело запроса: { "username", "email", "password", "role_id" }
- Требует роль admin

PUT /api/users/:id
- Обновить информацию о пользователе
- Требует роль admin

DELETE /api/users/:id
- Удалить пользователя
- Требует роль admin
```

### Управление устройствами
```
GET /api/devices
- Получить список устройств
- Параметры: page, limit, search, device_type_id, status, location
- Доступно для всех авторизованных пользователей

GET /api/devices/:id
- Получить информацию об устройстве и его комплектующих
- Доступно для всех авторизованных пользователей

POST /api/devices
- Создать новое устройство
- Требует роль writer или admin

PUT /api/devices/:id
- Обновить информацию об устройстве
- Требует роль writer или admin

DELETE /api/devices/:id
- Удалить устройство
- Требует роль admin
```

### Управление комплектующими
```
GET /api/components
- Получить список комплектующих
- Параметры: page, limit, search, component_type_id, status
- Доступно для всех авторизованных пользователей

GET /api/components/:id
- Получить информацию о комплектующем
- Доступно для всех авторизованных пользователей

POST /api/components
- Создать новое комплектующее
- Требует роль writer или admin

PUT /api/components/:id
- Обновить информацию о комплектующем
- Требует роль writer или admin

DELETE /api/components/:id
- Удалить комплектующее
- Требует роль admin
```

### Управление компонентами устройства
```
GET /api/devices/:id/components
- Получить список комплектующих для конкретного устройства
- Доступно для всех авторизованных пользователей

POST /api/devices/:device_id/components
- Добавить комплектующее к устройству
- Требует роль writer или admin

DELETE /api/devices/:device_id/components/:component_id
- Удалить комплектующее из устройства
- Требует роль writer или admin
```

### Управление фотографиями
```
POST /api/photos
- Загрузить новую фотографию
- Требует роль writer или admin

GET /api/photos/:entity_type/:entity_id
- Получить список фотографий для устройства или комплектующего
- Доступно для всех авторизованных пользователей

GET /api/photos/:id
- Получить конкретное фото (возвращает файл)
- Доступно для всех авторизованных пользователей

PUT /api/photos/:id/set-primary
- Установить фото как основное
- Требует роль writer или admin

DELETE /api/photos/:id
- Удалить фото
- Требует роль writer или admin
```

### Поиск
```
GET /api/search
- Поиск по базе данных
- Параметры: query, entity_type (device, component, all), page, limit
- Доступно для всех авторизованных пользователей

POST /api/search/advanced
- Расширенный поиск с фильтрами
- Тело запроса: объект с фильтрами
- Доступно для всех авторизованных пользователей
```

### Печать
```
GET /api/print/device/:id
- Получить данные для печати информации об устройстве
- Доступно для всех авторизованных пользователей

GET /api/print/component/:id
- Получить данные для печати информации о комплектующем
- Доступно для всех авторизованных пользователей

POST /api/print/batch
- Пакетная печать
- Тело запроса: { "entity_type", "ids": [] }
- Доступно для всех авторизованных пользователей
```

## Защита ресурсов по ролям:
- **reader**: может только просматривать информацию (GET-запросы)
- **writer**: может просматривать, создавать и редактировать информацию (GET, POST, PUT)
- **admin**: полный доступ ко всем функциям (GET, POST, PUT, DELETE) + управление пользователями

## Пользовательский интерфейс

### Структура проекта frontend:
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/          # Общие компоненты
│   │   ├── auth/            # Компоненты аутентификации
│   │   ├── devices/         # Компоненты для работы с устройствами
│   │   ├── components/      # Компоненты для работы с комплектующими
│   │   ├── users/           # Компоненты для управления пользователями
│   │   └── photos/          # Компоненты для работы с фотографиями
│   ├── pages/               # Страницы приложения
│   ├── services/            # Сервисы для работы с API
│   ├── types/               # TypeScript типы
│   ├── hooks/               # Пользовательские хуки
│   ├── utils/               # Утилиты
│   └── styles/              # Стили
├── package.json
└── tsconfig.json
```

### Основные страницы:
- Dashboard (Главная страница)
- Login (Страница входа)
- Devices (Управление устройствами)
- Components (Управление комплектующими)
- Users (Управление пользователями - для admin)
- Search (Поиск)
- Settings (Настройки)

## Система аутентификации и авторизации

### Серверная часть:
- Генерация и проверка JWT-токенов
- Хеширование паролей с использованием bcrypt
- Проверка ролей пользователей
- Middleware для защиты маршрутов

### Клиентская часть:
- Хранение токена в localStorage
- Перехват HTTP-запросов для добавления заголовка авторизации
- Компоненты для защиты маршрутов

## Функционал для работы с оборудованием

### Устройства:
- Создание, редактирование, удаление устройств
- Просмотр списка устройств с фильтрацией
- Добавление и удаление комплектующих к устройству
- Просмотр детальной информации об устройстве

### Комплектующие:
- Создание, редактирование, удаление комплектующих
- Просмотр списка комплектующих с фильтрацией
- Просмотр детальной информации о комплектующем

## Поиск и фильтрация данных

### Простой поиск:
- Поиск по ключевым полям (название, серийный номер, производитель)
- Возможность фильтрации по типу (устройства, комплектующие, все)

### Расширенный поиск:
- Поиск с дополнительными фильтрами (тип устройства/компонента, статус, местоположение)
- Сохранение истории поиска

## Функционал печати

- Печать информации об отдельных устройствах и комплектующих
- Пакетная печать нескольких записей
- Генерация печатных форм с полной информацией

## Тестирование системы

### Модульное тестирование:
- Тестирование моделей данных
- Тестирование сервисных функций
- Тестирование контроллеров
- Тестирование компонентов

### Интеграционное тестирование:
- Тестирование API endpoints
- Тестирование аутентификации и авторизации
- Тестирование связей между сущностями

### Функциональное тестирование:
- Тестирование пользовательских сценариев
- Тестирование всех ролей доступа
- Тестирование поиска и фильтрации
- Тестирование печати

## Документация

### Документация для разработчиков:
- Структура проекта
- Руководство по добавлению новых сущностей
- Руководство по деплою

### Руководство пользователя:
- Начало работы
- Навигация по системе
- Работа с устройствами и комплектующими
- Поиск и фильтрация
- Печать
- Управление пользователями (для admin)

### API документация:
- Описание всех endpoints
- Примеры запросов и ответов
- Описание параметров