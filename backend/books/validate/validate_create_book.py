from datetime import date


def vaidate_create_book(data):
    title = data.get("title")
    author = data.get("author")
    published_date = data.get("published_date")

    if not title or not author:
        return {"error": "Title and author are required"}

    if published_date:
        try:
            if not isinstance(published_date, date):
                date.fromisoformat(published_date)
        except (ValueError, TypeError):
            return {"error": "published_date must be in YYYY-MM-DD format"}

    return None