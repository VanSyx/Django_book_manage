from decimal import Decimal, InvalidOperation

from rest_framework.exceptions import ValidationError


def filter_books(queryset, query_params):
    title = query_params.get("title", "").strip()
    author = query_params.get("author", "").strip()
    price = query_params.get("price")
    quantity = query_params.get("quantity")

    if title:
        queryset = queryset.filter(title__icontains=title)

    if author:
        queryset = queryset.filter(author__icontains=author)

    if price not in (None, ""):
        try:
            price_value = Decimal(price)
        except (InvalidOperation, TypeError):
            raise ValidationError({"price": "Price must be a valid number."})

        if not price_value.is_finite():
            raise ValidationError({"price": "Price must be a finite number."})

        if price_value < 0:
            raise ValidationError({"price": "Price must not be negative."})

        queryset = queryset.filter(price=price_value)

    if quantity not in (None, ""):
        try:
            quantity_value = int(quantity)
        except (TypeError, ValueError):
            raise ValidationError({"quantity": "Quantity must be an integer."})

        if quantity_value < 0:
            raise ValidationError({"quantity": "Quantity must not be negative."})

        queryset = queryset.filter(quantity=quantity_value)

    return queryset
