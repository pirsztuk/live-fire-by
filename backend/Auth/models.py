from django.db import models

# Create your models here.


class Users(models.Model):

    Login = models.CharField(max_length=255)
    Password = models.CharField(max_length=255)
    
    Name = models.CharField(max_length=255)
    Surname = models.CharField(max_length=255)
