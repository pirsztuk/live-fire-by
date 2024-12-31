from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from django.db.models import Sum, F

from Orders.models import Orders
from Products.models import Products
from Customers.models import Customers

from LiveFire.global_funcs import auth_required, standard_response
from LiveFire import global_funcs

# Create your views here.

@auth_required()
class MainDashboardView(APIView):
    def get(self, request):

        
        

        # Get current date and date ranges
        today = datetime.now()
        current_month_start = today - timedelta(days=30)
        last_month_start = today - timedelta(days=60)
        last_month_end = today - timedelta(days=31)

        # Calculate profits for current month
        current_month_profits = Orders.objects.filter(
            DueDate__gte=current_month_start,
            DueDate__lte=today,
            OrderStatus=Orders.OrderStatusChoices.COMPLETED
        ).aggregate(
            profit=Sum(F('OrderTotal') - F('OrderCosts'))
        )['profit'] or 0

        # Calculate profits for last month
        last_month_profits = Orders.objects.filter(
            DueDate__gte=last_month_start,
            DueDate__lte=last_month_end,
            OrderStatus=Orders.OrderStatusChoices.COMPLETED
        ).aggregate(
            profit=Sum(F('OrderTotal') - F('OrderCosts'))
        )['profit'] or 0

        # Calculate percentage change
        if last_month_profits > 0:
            percentage_change = ((current_month_profits - last_month_profits) / last_month_profits) * 100
        else:
            percentage_change = 100 if current_month_profits > 0 else 0


        products_count = Products.objects.all().count()

        # Get count of new products added this month
        new_products_count = Products.objects.filter(
            CreatedAt__gte=current_month_start,
            CreatedAt__lte=today
        ).count()

        # Calculate percentage of new products
        new_products_percentage = (new_products_count / products_count * 100) if products_count > 0 else 0

        in_stock_products_count = 0
        
        for product in Products.objects.filter(InStock__gt=0):
            in_stock_products_count += product.InStock


        customers_count = Customers.objects.all().count()

        new_customers_count = Customers.objects.filter(
            CreatedAt__gte=current_month_start,
            CreatedAt__lte=today
        ).count()

        new_customers_percentage = (new_customers_count / customers_count * 100) if customers_count > 0 else 0


        return Response({
            'current_month_profits': current_month_profits,
            'percentage_change': round(percentage_change, 2),

            'products_count': products_count,
            'new_products_count': new_products_count,
            'new_products_percentage': round(new_products_percentage, 2),
            
            'in_stock_products_count': in_stock_products_count,

            'customers_count': customers_count,
            'new_customers_count': new_customers_count,
            'new_customers_percentage': round(new_customers_percentage, 2)
        }, status=status.HTTP_200_OK)

                