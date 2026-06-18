from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from rest_framework.exceptions import ValidationError


ALLOWED_PAGE_SIZES = {20, 100}
DEFAULT_PAGE_SIZE = 20


def get_page_size(query_params):
    requested_page_size = query_params.get("page_size")
    if requested_page_size is None:
        return DEFAULT_PAGE_SIZE

    try:
        page_size = int(requested_page_size)
    except (TypeError, ValueError):
        raise ValidationError({"page_size": "Page size must be either 20 or 100."})

    if page_size not in ALLOWED_PAGE_SIZES:
        raise ValidationError({"page_size": "Page size must be either 20 or 100."})

    return page_size


def paginate_queryset(queryset, query_params):
    page_size = get_page_size(query_params)
    requested_page = query_params.get("page", 1)
    paginator = Paginator(queryset, page_size)

    try:
        page = paginator.page(requested_page)
    except PageNotAnInteger:
        raise ValidationError({"page": "Page must be an integer."})
    except EmptyPage:
        raise ValidationError({"page": "Page does not exist."})

    return {
        "page": page,
        "count": paginator.count,
        "total_pages": paginator.num_pages,
        "current_page": page.number,
        "page_size": page_size,
        "next": page.next_page_number() if page.has_next() else None,
        "previous": page.previous_page_number() if page.has_previous() else None,
    }
