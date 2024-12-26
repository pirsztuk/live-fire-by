from django.db import models
from Customers.models import Customers
from Products.models import Products

# Create your models here.


class Orders(models.Model):

    Customer = models.ForeignKey(Customers, on_delete=models.SET_NULL, null=True)
    
    OrderDate = models.DateTimeField(auto_now_add=True)
    DueDate = models.DateTimeField(null=True)

    class OrderStatusChoices(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'В процессе'
        COMPLETED = 'completed', 'Завершен'
        CANCELLED = 'cancelled', 'Отменен'

    OrderStatus = models.CharField(max_length=255, choices=OrderStatusChoices.choices)
    
    OrderTotal = models.DecimalField(max_digits=10, decimal_places=2)


class OrderItems(models.Model):

    Order = models.ForeignKey(Orders, on_delete=models.CASCADE, related_name='OrderItems')
    Product = models.ForeignKey(Products, on_delete=models.SET_NULL, null=True)
    Quantity = models.IntegerField()
    Price = models.DecimalField(max_digits=10, decimal_places=2)
