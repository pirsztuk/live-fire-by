from rest_framework import serializers

class CustomersSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    Name = serializers.CharField()
    

class CustomerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    Name = serializers.CharField()
    Email = serializers.EmailField()
    Phone = serializers.CharField()
    Address = serializers.CharField()