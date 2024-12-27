from rest_framework.views import APIView
from rest_framework import status

from Products.models import Products
from Products.serializers import ProductsSerializer, ProductSerializer
from Products.forms import ProductsForm, ProductUpdateForm

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
    

    def put(self, request):

        form = ProductUpdateForm(request.POST)

        if form.is_valid():

            if Products.objects.filter(pk=form.cleaned_data['product_id']).exists():

                product = Products.objects.get(pk=form.cleaned_data['product_id'])

                if form.cleaned_data.get('Name') is not None:
                    product.Name = form.cleaned_data['Name']
                if form.cleaned_data.get('Price') is not None:
                    product.Price = form.cleaned_data['Price']
                if form.cleaned_data.get('Costs') is not None:
                    product.Costs = form.cleaned_data['Costs']
                if form.cleaned_data.get('Description') is not None:
                    product.Description = form.cleaned_data['Description']
                if form.cleaned_data.get('Image') is not None:
                    product.Image = form.cleaned_data['Image']
                if form.cleaned_data.get('InStock') is not None:
                    product.InStock = form.cleaned_data['InStock']
                product.save()

                return standard_response(message='Product updated')
            
            else:
                return standard_response(message='Product not found', status_code=status.HTTP_404_NOT_FOUND)
        
        return standard_response(data=form.errors, status_code=status.HTTP_400_BAD_REQUEST)
    

    def delete(self, request):

        fields = ['product_id']

        if global_funcs.check_fileds_in_request(request, "DELETE", fields):

            if type(request.data.get('product_id')) == int or request.data.get('product_id').isdigit():

                if Products.objects.filter(pk=request.data.get('product_id')).exists():

                    product = Products.objects.get(id=request.data.get('product_id'))

                    product.delete()

                    return standard_response(message='Product deleted successfully')
        
        return standard_response(message='Product not found', status_code=status.HTTP_404_NOT_FOUND)