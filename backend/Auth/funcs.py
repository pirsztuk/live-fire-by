import jwt
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from django.core.cache import cache


def generate_token(user_id):

    access_token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + settings.JWT_SETTINGS["ACCESS_TOKEN_LIFETIME"],
        'type': 'access'
    }, settings.JWT_SETTINGS["SECRET_KEY"], algorithm=settings.JWT_SETTINGS["ALGORITHM"])
    
    return access_token