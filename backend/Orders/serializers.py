from rest_framework import serializers
from Orders.models import Orders, OrderItems
from Customers.serializers import CustomerSerializer
from Products.serializers import ProductSerializer


class OrdersSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    CustomerName = serializers.SerializerMethodField()
    DueDate = serializers.DateTimeField()
    OrderStatus = serializers.CharField()
    OrderTotal = serializers.DecimalField(max_digits=10, decimal_places=2)

    def get_CustomerName(self, obj):
        return obj.Customer.Name


class OrderItemSerializer(serializers.Serializer):
    
    id = serializers.IntegerField()
    Product = serializers.SerializerMethodField()
    Quantity = serializers.IntegerField()   
    Price = serializers.DecimalField(max_digits=10, decimal_places=2)

    def get_Product(self, obj): 
        return ProductSerializer(obj.Product).data




class OrderSerializer(serializers.ModelSerializer):
    OrderItems = OrderItemSerializer(many=True)

    Customer = serializers.SerializerMethodField()

    def get_Customer(self, obj):
        return CustomerSerializer(obj.Customer).data
    
    class Meta:
        model = Orders
        fields = '__all__'