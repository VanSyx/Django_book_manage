
from django.urls import path
from books import views
from books.view_books import books

urlpatterns = [
    path('home', views.home, name='home'),
    path('books', books, name='books'),
]
