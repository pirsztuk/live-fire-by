from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from Orders.models import Orders
from Orders.serializers import OrderSerializer
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
                return standard_response(data=OrderSerializer(orders, many=True).data)
            
            elif request.GET.get('type') == 'active':

                orders = Orders.objects.filter(OrderStatus=Orders.OrderStatusChoices.IN_PROGRESS)
                return standard_response(data=OrderSerializer(orders, many=True).data)
            
            elif request.GET.get('type') == 'completed':

                orders = Orders.objects.filter(OrderStatus=Orders.OrderStatusChoices.COMPLETED)
                return standard_response(data=OrderSerializer(orders, many=True).data)
            
            elif request.GET.get('type') == 'cancelled':

                orders = Orders.objects.filter(OrderStatus=Orders.OrderStatusChoices.CANCELLED)
                return standard_response(data=OrderSerializer(orders, many=True).data)
            
            
        return standard_response(message='Incorrect fields', status_code=status.HTTP_400_BAD_REQUEST)
    

class OrderView(APIView):
    def get(self, request):

        fields = ['order_id']

        if global_funcs.check_fileds_in_request(request, "GET", fields):

            if request.GET.get('order_id').isdigit():

                if Orders.objects.filter(pk=request.GET.get('order_id')).exists():

                    Order = Orders.objects.get(id=request.GET.get('order_id'))

                    
            return standard_response(data=OrderSerializer(order).data)
        
        return standard_response(message='Incorrect fields', status_code=status.HTTP_400_BAD_REQUEST)