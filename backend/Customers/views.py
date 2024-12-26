from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from Customers.models import Customers
from Customers.serializers import CustomersSerializer, CustomerSerializer
from Customers.forms import CustomerForm, CustomerUpdateForm

from LiveFire.global_funcs import auth_required, standard_response
from LiveFire import global_funcs

# Create your views here.

@auth_required()
class CustomersView(APIView):
    def get(self, request):

        customers = Customers.objects.all()
        serializer = CustomersSerializer(customers, many=True)
        return standard_response(data=serializer.data)


@auth_required()
class CustomerView(APIView):
    def get(self, request):

        fields = ['customer_id']

        if global_funcs.check_fields(request, "GET", fields):

            if request.GET.get('customer_id').isdigit():
                if Customers.objects.filter(id=request.GET.get('customer_id')).exists():
                    customer = Customers.objects.get(id=request.GET.get('customer_id'))
                    serializer = CustomerSerializer(customer)
                    return standard_response(data=serializer.data)

        
        return standard_response(message='Customer not found', status_code=status.HTTP_404_NOT_FOUND)
    

    def post(self, request):

        form = CustomerForm(request.POST)

        if form.is_valid():

            customer = Customers.objects.create(
                Name=form.cleaned_data['Name'],
                Email=form.cleaned_data.get('Email', None),
                Phone=form.cleaned_data.get('Phone', None),
                Address=form.cleaned_data.get('Address', None)
            )
            customer.save()

            return standard_response(data={'customer_id': customer.id})
        
        else:
            return standard_response(data=form.errors, status_code=status.HTTP_400_BAD_REQUEST)


    def put(self, request):

        form = CustomerUpdateForm(request.POST)

        if form.is_valid():
            if Customers.objects.filter(id=form.cleaned_data['id']).exists():
                customer = Customers.objects.get(id=form.cleaned_data['id'])
                customer.Name = form.cleaned_data.get('Name', customer.Name)
                customer.Email = form.cleaned_data.get('Email', customer.Email)
                customer.Phone = form.cleaned_data.get('Phone', customer.Phone)
                customer.Address = form.cleaned_data.get('Address', customer.Address)
                customer.save()
                return standard_response(message='Customer updated')
            else:
                return standard_response(message='Customer not found', status_code=status.HTTP_404_NOT_FOUND)
        else:
            return standard_response(data=form.errors, status_code=status.HTTP_400_BAD_REQUEST)
        

    def delete(self, request):

        fields = ['customer_id']

        if global_funcs.check_fields(request, "DELETE", fields):
            if request.GET.get('customer_id').isdigit():
                if Customers.objects.filter(id=request.GET.get('customer_id')).exists():
                    customer = Customers.objects.get(id=request.GET.get('customer_id'))
                    customer.delete()
                    return standard_response(message='Customer deleted')
                else:
                    return standard_response(message='Customer not found', status_code=status.HTTP_404_NOT_FOUND)
            
        return standard_response(message='Incorrect fields', status_code=status.HTTP_400_BAD_REQUEST)