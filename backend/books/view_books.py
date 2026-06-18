from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from books.models import Book
from books.serializers import BookSerializer
from books.services import create_book, get_paginated_books, update_book


@api_view(["GET", "POST"])
def book_list(request):
    if request.method == "GET":
        return Response(get_paginated_books(request.query_params))

    if not request.user.is_authenticated:
        return Response(
            {"detail": "Authentication credentials were not provided."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    book_data = create_book(request.data)
    return Response(
        {
            "message": "Book created successfully",
            "book": book_data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
def book_detail(request, pk):
    book = get_object_or_404(Book, pk=pk)

    if request.method == "GET":
        serializer = BookSerializer(book)
        return Response({"book": serializer.data})

    if not request.user.is_authenticated:
        return Response(
            {"detail": "Authentication credentials were not provided."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if request.method in {"PUT", "PATCH"}:
        book_data = update_book(
            book,
            request.data,
            partial=request.method == "PATCH",
        )
        return Response(
            {
                "message": "Book updated successfully",
                "book": book_data,
            }
        )

    book.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
