from django.db import models
import random
import string
import os

# Create your models here.

class Products(models.Model):

    def upload_product(instance, filename):

        """
            Constructs a path that includes the model instance's ID.
            This function assumes that the instance has been saved and has a valid ID.
        """
        extension = os.path.splitext(filename)[1].lower()

        filename = ''.join(random.choice(string.ascii_letters) for _ in range(32))
        return f"products/{filename}{extension}"
    
    
    Name = models.CharField(max_length=255)
    Price = models.DecimalField(max_digits=10, decimal_places=2)
    Costs = models.DecimalField(max_digits=10, decimal_places=2)
    Description = models.TextField(default='')
    Image = models.ImageField(upload_to=upload_product)

    InStock = models.IntegerField(default=0)
