import json

from django.test import TestCase

from books.models import Book


class BookApiTests(TestCase):
    def setUp(self):
        self.book = Book.objects.create(
            title="Clean Code",
            author="Robert C. Martin",
            published_date="2008-08-01",
        )

    def test_get_books_returns_list(self):
        response = self.client.get("/api/books/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["books"]), 1)
        self.assertEqual(data["books"][0]["title"], self.book.title)

    def test_post_books_creates_book(self):
        payload = {
            "title": "The Pragmatic Programmer",
            "author": "Andrew Hunt",
            "published_date": "1999-10-20",
        }

        response = self.client.post(
            "/api/books/",
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Book.objects.count(), 2)
        self.assertEqual(response.json()["book"]["title"], payload["title"])

    def test_get_book_detail_returns_book(self):
        response = self.client.get(f"/api/books/{self.book.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["book"]["id"], self.book.id)

    def test_put_book_detail_updates_book(self):
        payload = {
            "title": "Refactoring",
            "author": "Martin Fowler",
            "published_date": "2018-11-19",
        }

        response = self.client.put(
            f"/api/books/{self.book.id}/",
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.book.refresh_from_db()
        self.assertEqual(self.book.title, payload["title"])
        self.assertEqual(self.book.author, payload["author"])

    def test_delete_book_detail_deletes_book(self):
        response = self.client.delete(f"/api/books/{self.book.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Book.objects.filter(id=self.book.id).exists())
