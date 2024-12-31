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

                orders = Orders.objects.exclude(OrderStatus=Orders.OrderStatusChoices.CANCELLED)
                return standard_response(data=OrdersSerializer(orders, many=True).data)
            
            elif request.GET.get('type') == 'active':

                orders = Orders.objects.filter(OrderStatus=Orders.OrderStatusChoices.IN_PROGRESS)
                return standard_response(data=OrdersSerializer(orders, many=True).data)
            
            elif request.GET.get('type') == 'packed':

                orders = Orders.objects.filter(OrderStatus=Orders.OrderStatusChoices.PACKED)
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
                OrderCosts=0,
            )
            Order.save()

            total_price = 0
            total_costs = 0

            for product_id, quantity in form.cleaned_data['cart_data'].items():
                product = Products.objects.get(pk=product_id)

                product.InStock -= quantity
                product.save()

                OrderItem = OrderItems.objects.create(
                    Order=Order,
                    Product=product,
                    Quantity=quantity,
                    Price=product.Price*quantity,
                )
                OrderItem.save()
                total_price += product.Price*quantity
                total_costs += product.Costs*quantity
            
            Order.OrderTotal = total_price
            Order.OrderCosts = total_costs
            Order.save()



            return standard_response(message='Order created successfully', data={'order_id': Order.pk})
        
        return standard_response(message='Incorrect fields', data=form.errors, status_code=status.HTTP_400_BAD_REQUEST)


    def put(self, request):

        fields = ['order_id', 'status']

        if global_funcs.check_fileds_in_request(request, "PATCH", fields):

            if request.data.get('order_id').isdigit():

                if Orders.objects.filter(pk=request.data.get('order_id')).exists():

                    Order = Orders.objects.get(pk=request.data.get('order_id'))

                    if Order.OrderStatus == Orders.OrderStatusChoices.CANCELLED:
                        return standard_response(message='Order is cancelled', status_code=status.HTTP_400_BAD_REQUEST)

                    if request.data.get('status') == "completed":    

                        Order.OrderStatus = Orders.OrderStatusChoices.COMPLETED

                    elif request.data.get('status') == "packed":

                        Order.OrderStatus = Orders.OrderStatusChoices.PACKED

                    elif request.data.get('status') == "in_progress":

                        Order.OrderStatus = Orders.OrderStatusChoices.IN_PROGRESS

                    else:
                        return standard_response(message='Incorrect status', status_code=status.HTTP_400_BAD_REQUEST)
                    
                    Order.save()

                    return standard_response(message='Order status updated successfully')
                
            return standard_response(message='Order not found', status_code=status.HTTP_404_NOT_FOUND)
        
        return standard_response(message='Incorrect fields', status_code=status.HTTP_400_BAD_REQUEST)


    def delete(self, request):

        fields = ['order_id']


        if global_funcs.check_fileds_in_request(request, "DELETE", fields):

            if request.data.get('order_id').isdigit():

                if Orders.objects.filter(pk=request.data.get('order_id')).exists():

                    Order = Orders.objects.get(pk=request.data.get('order_id'))

                    if Order.OrderStatus != Orders.OrderStatusChoices.COMPLETED or Order.OrderStatus != Orders.OrderStatusChoices.CANCELLED:

                        for item in Order.OrderItems.all():

                            item.Product.InStock += item.Quantity
                            item.Product.save()

                        Order.OrderStatus = Orders.OrderStatusChoices.CANCELLED
                        Order.save()

                        return standard_response(message='Order deleted successfully')
                    
                    return standard_response(message='Order is completed', status_code=status.HTTP_400_BAD_REQUEST)
                
            return standard_response(message='Order not found', status_code=status.HTTP_404_NOT_FOUND)
        
        return standard_response(message='Incorrect fields', status_code=status.HTTP_400_BAD_REQUEST)