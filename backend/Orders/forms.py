# forms.py

import json
from django import forms
from django.core.exceptions import ValidationError
from Products.models import Products
from Customers.models import Customers

class CartForm(forms.Form):
    cart_data = forms.JSONField(required=True)

    customer_id = forms.IntegerField(required=True)

    due_date = forms.DateField(required=True)

    def clean_cart_data(self):

        data = self.cleaned_data['cart_data']

        if not isinstance(data, dict):
            raise forms.ValidationError("Expected JSON object (dictionary).")

        for key, value in data.items():
            # Проверяем, что ключ можно привести к int
            try:
                int(key)
            except ValueError:
                raise forms.ValidationError(f"Key '{key}' is not an integer (product ID).")
            
            if not Products.objects.filter(pk=key).exists():
                raise forms.ValidationError(f"Product with id={key} not found in the database.")

            # Проверим, что количество — целое положительное
            if not isinstance(value, int) or value < 1:
                raise forms.ValidationError(
                    f"Quantity for product '{key}' must be an integer > 0."
                )

        return data
    

    def clean_customer_id(self):

        customer_id = self.cleaned_data['customer_id']

        if not Customers.objects.filter(pk=customer_id).exists():
            raise forms.ValidationError(f"Customer with id={customer_id} not found in the database.")

        return customer_id

