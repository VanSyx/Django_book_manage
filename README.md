# Book Manage

Dự án Django `book_manage` là ứng dụng quản lý sách đơn giản.

## Tổng quan

- Django 5.2
- REST framework được dùng cho serializer và class-based view

## Yêu cầu

- Python 3.10+ (hoặc phiên bản Python tương thích với Django 5.2)
- Django
- djangorestframework

## Cài đặt

1. Kích hoạt virtual environment:

```powershell
cd .\book_manage
.\venv\Scripts\Activate.ps1
```

2. Cài đặt dependencies:

```powershell
pip install -r requirements.txt
```

3. Tạo và áp dụng migration:

```powershell
python manage.py makemigrations
python manage.py migrate
```

4. Khởi chạy server:

```powershell
python manage.py runserver
```