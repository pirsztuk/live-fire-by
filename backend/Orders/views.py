from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from Orders.models import Orders, OrderItems
from Products.models import Products
from Customers.models import Customers
from Orders.serializers import OrderSerializer, OrdersSerializer
from Orders.forms import CartForm

from LiveFire.global_funcs import auth_required, standard_response
from LiveFire import global_funcs

# Create your views here.

@auth_required()
class OrdersView(APIView):
    def get(self, request):

        fields = ['type']

        if global_funcs.check_fileds_in_request(request, "GET", fields):

            if request.GET.get('type') == 'all':

                orders = Orders.objects.all()
                return standard_response(data=OrdersSerializer(orders, many=True).data)
            
            elif request.GET.get('type') == 'active':

                orders = Orders.objects.filter(OrderStatus=Orders.OrderStatusChoices.IN_PROGRESS)
                return standard_response(data=OrdersSerializer(orders, many=True).data)
            
            elif request.GET.get('type') == 'completed':

                orders = Orders.objects.filter(OrderStatus=Orders.OrderStatusChoices.COMPLETED)
                return standard_response(data=OrdersSerializer(orders, many=True).data)
            
            elif request.GET.get('type') == 'cancelled':

                orders = Orders.objects.filter(OrderStatus=Orders.OrderStatusChoices.CANCELLED)
                return standard_response(data=OrdersSerializer(orders, many=True).data)
            
            
        return standard_response(message='Incorrect fields', status_code=status.HTTP_400_BAD_REQUEST)
    

@auth_required()
class OrderView(APIView):
    def get(self, request):

        fields = ['order_id']

        if global_funcs.check_fileds_in_request(request, "GET", fields):

            if request.GET.get('order_id').isdigit():

                if Orders.objects.filter(pk=request.GET.get('order_id')).exists():

                    Order = Orders.objects.get(id=request.GET.get('order_id'))

                    
                    return standard_response(data=OrderSerializer(Order).data)
                
            return standard_response(message='Order not found', status_code=status.HTTP_404_NOT_FOUND)
        
        return standard_response(message='Incorrect fields', status_code=status.HTTP_400_BAD_REQUEST)
    

    def post(self, request):

        form = CartForm(request.data)

        if form.is_valid():

            Order = Orders.objects.create(
                Customer=Customers.objects.get(pk=form.cleaned_data['customer_id']),
                DueDate=form.cleaned_data['due_date'],
                OrderStatus=Orders.OrderStatusChoices.IN_PROGRESS,
                OrderTotal=0,
            )
            Order.save()

            total_price = 0

            for product_id, quantity in form.cleaned_data['cart_data'].items():
                OrderItem = OrderItems.objects.create(
                    Order=Order,
                    Product=Products.objects.get(pk=product_id),
                    Quantity=quantity,
                    Price=Products.objects.get(pk=product_id).Price*quantity,
                )
                OrderItem.save()
                total_price += Products.objects.get(pk=product_id).Price*quantity

            Order.OrderTotal = total_price
            Order.save()

            return standard_response(message='Order created successfully', data={'order_id': Order.pk})
        
        return standard_response(message='Incorrect fields', data=form.errors, status_code=status.HTTP_400_BAD_REQUEST)


    def put(self, request):

        fields = ['order_id', 'status']

        if global_funcs.check_fileds_in_request(request, "PUT", fields):

            if request.PUT.get('order_id').isdigit():

                if Orders.objects.filter(pk=request.PUT.get('order_id')).exists():

                    Order = Orders.objects.get(pk=request.PUT.get('order_id'))

                    if request.PUT.get('status') == "completed":    

                        Order.OrderStatus = Orders.OrderStatusChoices.COMPLETED

                    elif request.PUT.get('status') == "cancelled":

                        Order.OrderStatus = Orders.OrderStatusChoices.CANCELLED

                    elif request.PUT.get('status') == "packed":

                        Order.OrderStatus = Orders.OrderStatusChoices.PACKED

                    else:
                        return standard_response(message='Incorrect status', status_code=status.HTTP_400_BAD_REQUEST)
                    
                    Order.save()

                    return standard_response(message='Order status updated successfully')
                
            return standard_response(message='Order not found', status_code=status.HTTP_404_NOT_FOUND)
        
        return standard_response(message='Incorrect fields', status_code=status.HTTP_400_BAD_REQUEST)
