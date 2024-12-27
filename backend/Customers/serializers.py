from rest_framework import serializers

class CustomersSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    Name = serializers.CharField()

    MoneySpent = serializers.SerializerMethodField()
    
    def get_MoneySpent(self, obj):
        return 0
    

class CustomerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    Name = serializers.CharField()
    Email = serializers.EmailField()
    Phone = serializers.CharField()
    Address = serializers.CharField()