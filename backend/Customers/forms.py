from django import forms

class CustomerForm(forms.Form):
    Name = forms.CharField()
    Email = forms.EmailField(required=False)
    Phone = forms.CharField(required=False)
    Address = forms.CharField(required=False)


class CustomerUpdateForm(forms.Form):
    customer_id = forms.IntegerField()
    Name = forms.CharField(required=False, empty_value=None)
    Email = forms.EmailField(required=False, empty_value=None)
    Phone = forms.CharField(required=False, empty_value=None)
    Address = forms.CharField(required=False, empty_value=None)