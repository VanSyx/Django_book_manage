# Django Book Manage

Book management application with a Django REST API and a separate frontend
source directory.

## Project structure

```text
backend/
  book_manage/        Django project settings and root URLs
  books/              Book model, API, filters, pagination, and tests
  manage.py
  requirements.txt
frontend/
  templates/          Django-rendered Home page
  static/             Home page CSS and JavaScript
screenshots/
  home-book-list.png
```

The frontend and backend are separated by directory, while Django still serves
the Home page and static assets. All frontend CRUD operations call the REST API.

## Features

- List books with 20 or 100 records per page
- Filter by title, author, price, and quantity
- Create, view, update, and delete books
- Home screen with pagination, filters, forms, and delete confirmation
- Token login via `POST /api/token/`
- Logout via `POST /api/logout/`

## Setup

From the repository root:

```powershell
.\venv\Scripts\Activate.ps1
cd .\backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Open:

```text
http://127.0.0.1:8000/
```

## Tests

```powershell
cd .\backend
python manage.py test
```

## API endpoints

```text
GET    /api/books/
POST   /api/books/
GET    /api/books/<id>/
PUT    /api/books/<id>/
PATCH  /api/books/<id>/
DELETE /api/books/<id>/
POST   /api/token/
POST   /api/logout/
```

Write operations (`POST`, `PUT`, `PATCH`, `DELETE`) require:

```text
Authorization: Token <token>
```
