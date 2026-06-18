from books.filters import filter_books
from books.models import Book
from books.pagination import paginate_queryset
from books.serializers import BookSerializer


def get_paginated_books(query_params):
    queryset = Book.objects.all().order_by("id")
    queryset = filter_books(queryset, query_params)
    pagination = paginate_queryset(queryset, query_params)
    serializer = BookSerializer(pagination["page"].object_list, many=True)

    next_page = pagination["next"]
    previous_page = pagination["previous"]
    return {
        "count": pagination["count"],
        "total_pages": pagination["total_pages"],
        "current_page": pagination["current_page"],
        "page_size": pagination["page_size"],
        "next": next_page,
        "previous": previous_page,
        "books": serializer.data,
    }


def create_book(data):
    serializer = BookSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.data


def update_book(book, data, partial=False):
    serializer = BookSerializer(book, data=data, partial=partial)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.data
