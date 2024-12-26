from rest_framework import serializers
from django.conf import settings
from .models import Products
from urllib.parse import urlparse, urlunparse

class ProductsSerializer(serializers.Serializer):
    
    id = serializers.IntegerField()
    Name = serializers.CharField()
    Price = serializers.DecimalField(max_digits=10, decimal_places=2)
    Description = serializers.CharField()
    ImageURL = serializers.SerializerMethodField()
    InStock = serializers.IntegerField()

    def get_ImageURL(self, obj):
        image_url = obj.Image.url


        return image_url.replace('http://minio:9000', '')
    

class ProductSerializer(serializers.Serializer):

    id = serializers.IntegerField()
    Name = serializers.CharField()
    Price = serializers.DecimalField(max_digits=10, decimal_places=2)
    Costs = serializers.DecimalField(max_digits=10, decimal_places=2)
    Description = serializers.CharField()
    ImageURL = serializers.SerializerMethodField()
    InStock = serializers.IntegerField()

    def get_ImageURL(self, obj):
        image_url = obj.Image.url


        return image_url.replace('http://minio:9000', '')
