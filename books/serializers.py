from books.models import Book

from rest_framework import serializers

class BookListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"
        # fields = ("id", "title", "author")
