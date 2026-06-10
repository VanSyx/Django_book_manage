import json

from django.test import TestCase

from books.models import Book


class BookApiTests(TestCase):
    def setUp(self):
        self.book = Book.objects.create(
            title="Clean Code",
            author="Robert C. Martin",
            published_date="2008-08-01",
            price="25.50",
            quantity=10,
        )

    def test_get_books_returns_list(self):
        response = self.client.get("/api/books/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["books"]), 1)
        self.assertEqual(data["books"][0]["title"], self.book.title)
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["page_size"], 20)

    def test_post_books_creates_book(self):
        payload = {
            "title": "The Pragmatic Programmer",
            "author": "Andrew Hunt",
            "published_date": "1999-10-20",
            "price": "30.00",
            "quantity": 5,
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
            "price": "45.00",
            "quantity": 7,
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

    def test_get_books_uses_default_page_size_of_20(self):
        Book.objects.bulk_create(
            [
                Book(
                    title=f"Book {index}",
                    author="Test Author",
                    published_date="2020-01-01",
                    price="10.00",
                    quantity=index,
                )
                for index in range(25)
            ]
        )

        first_page = self.client.get("/api/books/")
        second_page = self.client.get("/api/books/?page=2")

        self.assertEqual(first_page.status_code, 200)
        self.assertEqual(len(first_page.json()["books"]), 20)
        self.assertEqual(first_page.json()["count"], 26)
        self.assertEqual(first_page.json()["total_pages"], 2)
        self.assertEqual(len(second_page.json()["books"]), 6)

    def test_get_books_accepts_page_size_of_100(self):
        Book.objects.bulk_create(
            [
                Book(
                    title=f"Book {index}",
                    author="Test Author",
                    published_date="2020-01-01",
                    price="10.00",
                    quantity=index,
                )
                for index in range(25)
            ]
        )

        response = self.client.get("/api/books/?page_size=100")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["page_size"], 100)
        self.assertEqual(len(response.json()["books"]), 26)

    def test_get_books_filters_using_custom_filter_function(self):
        Book.objects.create(
            title="Django for APIs",
            author="William Vincent",
            published_date="2022-01-01",
            price="40.00",
            quantity=3,
        )

        response = self.client.get(
            "/api/books/",
            {
                "title": "django",
                "author": "vincent",
                "price": "40.00",
                "quantity": "3",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)
        self.assertEqual(response.json()["books"][0]["title"], "Django for APIs")

    def test_get_books_rejects_invalid_filter_values(self):
        response = self.client.get("/api/books/?price=invalid&quantity=abc")

        self.assertEqual(response.status_code, 400)
        self.assertIn("price", response.json())

    def test_get_books_rejects_unsupported_page_size(self):
        response = self.client.get("/api/books/?page_size=50")

        self.assertEqual(response.status_code, 400)
        self.assertIn("page_size", response.json())
