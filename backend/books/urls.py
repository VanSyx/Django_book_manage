
from django.urls import path

from books.auth_views import CustomAuthToken, logout
from books.view_books import book_detail, book_list

urlpatterns = [
    path("token/", CustomAuthToken.as_view(), name="api-token"),
    path("logout/", logout, name="api-logout"),
    path("books/", book_list, name="book-list"),
    path("books/<int:pk>/", book_detail, name="book-detail"),
]
