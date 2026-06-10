from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class BookPagination(PageNumberPagination):
    page_size = 20
    page_query_param = "page"
    page_size_query_param = "page_size"
    allowed_page_sizes = {20, 100}

    def get_page_size(self, request):
        requested_page_size = request.query_params.get(self.page_size_query_param)
        if requested_page_size is None:
            return self.page_size

        try:
            page_size = int(requested_page_size)
        except (TypeError, ValueError):
            raise ValidationError(
                {"page_size": "Page size must be either 20 or 100."}
            )

        if page_size not in self.allowed_page_sizes:
            raise ValidationError(
                {"page_size": "Page size must be either 20 or 100."}
            )

        return page_size

    def get_paginated_response(self, data):
        return Response(
            {
                "count": self.page.paginator.count,
                "total_pages": self.page.paginator.num_pages,
                "current_page": self.page.number,
                "page_size": self.page.paginator.per_page,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "books": data,
            }
        )
