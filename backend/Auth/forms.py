from django import forms

class LoginForm(forms.Form):
	
	Login = forms.CharField()
	Password = forms.CharField()