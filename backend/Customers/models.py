from django.db import models

# Create your models here.

class Customers(models.Model):
    Name = models.CharField(max_length=255)
    Email = models.EmailField(max_length=255, null=True)
    Phone = models.CharField(max_length=255, null=True)
    Address = models.CharField(max_length=255, null=True)

    CreatedAt = models.DateTimeField(auto_now_add=True)
    UpdatedAt = models.DateTimeField(auto_now=True)