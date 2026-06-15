from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from books.filters import filter_books
from books.models import Book
from books.pagination import BookPagination
from books.serializers import BookSerializer


@api_view(["GET", "POST"])
def book_list(request):
    if request.method == "GET":
        queryset = Book.objects.all().order_by("id")
        queryset = filter_books(queryset, request.query_params)

        paginator = BookPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = BookSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    serializer = BookSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "message": "Book created successfully",
                "book": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
def book_detail(request, pk):
    book = get_object_or_404(Book, pk=pk)

    if request.method == "GET":
        serializer = BookSerializer(book)
        return Response({"book": serializer.data})

    if request.method in {"PUT", "PATCH"}:
        serializer = BookSerializer(
            book,
            data=request.data,
            partial=request.method == "PATCH",
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Book updated successfully",
                    "book": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    book.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
