from rest_framework.response import Response
from rest_framework import status
from django.http import HttpRequest,  HttpResponseForbidden
from django.conf import settings
from typing import Optional
import requests
import jwt


def auth_required():
    def decorator(cls):
        class AuthView(cls):
            def dispatch(self, request, *args, **kwargs):

                if request.method in ["GET", "POST", "PATCH", "DELETE"]:

                    authenticated = False

                    if request.headers.get("Authorization"):

                        auth_token = request.headers.get("Authorization").split("Bearer ")[1]
                        
                        if is_token_valid(auth_token):

                            authenticated = True


                    if not authenticated:
                        return HttpResponseForbidden("Unauthorized")

                return super().dispatch(request, *args, **kwargs)

        return AuthView

    return decorator


def check_fileds_in_request(request, request_type, fields):
    selected_request_type = None

    if request_type.lower() == "get":
        selected_request_type = request.query_params
    elif request_type.lower() in ["post", "patch", "delete"]:
        selected_request_type = request.data

    for field in fields:
        if field not in selected_request_type:
            return False

    return True


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_city_by_ip(ip_address):
    url = f"https://ipinfo.io/{ip_address}/json"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()

        if data.get('city'):

            return data.get('city')
        
        return "Не определено"
        
    else:
        return "Не определено"


def standard_response(data=None, message=None, status_code=status.HTTP_200_OK, errors=None):
    response = {
        'status': 'success' if status_code < 400 else 'error',
        'message': message,
        'data': data,
        'errors': errors
    }
    return Response(response, status=status_code)


def decode_token(token):
    try:
        payload = jwt.decode(token, settings.JWT_SETTINGS["SECRET_KEY"], algorithms=[settings.JWT_SETTINGS["ALGORITHM"]])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    

def is_token_valid(token):
    payload = decode_token(token)
    if payload:
        if  payload.get('user_id') and payload.get('type') == 'access':
            return True
    return False