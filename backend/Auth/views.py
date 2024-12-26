from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from Auth.forms import LoginForm
from Auth.models import Users
from Auth.funcs import generate_token

from LiveFire.global_funcs import auth_required, standard_response

# Create your views here.


class LoginView(APIView):
    def post(self, request):

        form = LoginForm(request.data)
        if form.is_valid():
            login = form.cleaned_data['Login']
            password = form.cleaned_data['Password']

            if Users.objects.filter(Login=login, Password=password).exists():
                user = Users.objects.get(Login=login, Password=password)

                token = generate_token(user.pk)

                return standard_response(data={'token': token})


        return standard_response(status_code=status.HTTP_400_BAD_REQUEST, message='Invalid login or password')

