from rest_framework.views import APIView
from rest_framework import status

from Products.models import Products
from Products.serializers import ProductsSerializer, ProductSerializer
from Products.forms import ProductsForm

from LiveFire.global_funcs import auth_required, standard_response
from LiveFire import global_funcs

# Create your views here.

@auth_required()
class ProductsView(APIView):
    def get(self, request):

        products = Products.objects.all()

        serializer = ProductsSerializer(products, many=True)

        return standard_response(data={'products': serializer.data})
    

@auth_required()
class ProductView(APIView):

    def get(self, request):

        fields = ['product_id']

        if global_funcs.check_fileds_in_request(request, "GET", fields):

            if request.GET.get('product_id').isdigit():

                if Products.objects.filter(pk=request.GET.get('product_id')).exists():

                    product = Products.objects.get(id=request.GET.get('product_id'))

                    serializer = ProductSerializer(product)

                    return standard_response(data={'product': serializer.data})
        
        return standard_response(message='Product not found', status_code=status.HTTP_404_NOT_FOUND)
    

    def post(self, request):

        form = ProductsForm(request.POST, request.FILES)

        if form.is_valid():
            
            product = Products(
                Name=form.cleaned_data['Name'],
                Price=form.cleaned_data['Price'],
                Costs=form.cleaned_data['Costs'],
                Description=form.cleaned_data['Description'],
                Image=form.cleaned_data['Image'],
                InStock=form.cleaned_data['InStock']
            )

            product.save()
            
            return standard_response(message='Product created successfully')
        
        return standard_response(data={'error': form.errors}, status_code=status.HTTP_400_BAD_REQUEST)


    def delete(self, request):

        fields = ['product_id']

        if global_funcs.check_fileds_in_request(request, "DELETE", fields):

            if request.GET.get('product_id').isdigit():

                if Products.objects.filter(pk=request.GET.get('product_id')).exists():

                    product = Products.objects.get(id=request.GET.get('product_id'))

                    product.delete()

                    return standard_response(message='Product deleted successfully')
        
        return standard_response(message='Product not found', status_code=status.HTTP_404_NOT_FOUND)