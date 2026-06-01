import json
from datetime import datetime, date

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from books.models import Book
from books.serializers import BookListSerializer
from books.validate.validate_create_book import vaidate_create_book

# Create your views here.

def get_request_data(request):
    if request.content_type and "application/json" in request.content_type:
        try:
            return json.loads(request.body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            return None
    return request.POST.dict()


def parse_published_date(value):
    if not value:
        return None

    if isinstance(value, date):
        return value

    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


@csrf_exempt
def books(request):
    data = get_request_data(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    if request.method == "GET":
        book_id = request.GET.get("id")
        if book_id:
            try:
                book = Book.objects.get(id=book_id)
            except Book.DoesNotExist:
                return JsonResponse({"error": "Book not found"}, status=404)
            return JsonResponse({"book": BookListSerializer(book).data})

        queryset = Book.objects.all()
        data_books = BookListSerializer(queryset, many=True)
        return JsonResponse({"books": data_books.data})

    if request.method == "POST":
        errors = vaidate_create_book(data)
        if errors:
            return JsonResponse(errors, status=400)

        title = data.get("title")
        author = data.get("author")
        published_date = parse_published_date(data.get("published_date")) or datetime.now().date()

        book = Book.objects.create(
            title=title,
            author=author,
            published_date=published_date,
        )
        return JsonResponse(
            {"message": "Book created successfully"},
        )