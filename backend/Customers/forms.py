from django import forms

class CustomerForm(forms.Form):
    Name = forms.CharField()
    Email = forms.EmailField(required=False)
    Phone = forms.CharField(required=False)
    Address = forms.CharField(required=False)


class CustomerUpdateForm(forms.Form):
    id = forms.IntegerField()
    Name = forms.CharField(required=False)
    Email = forms.EmailField(required=False)
    Phone = forms.CharField(required=False)
    Address = forms.CharField(required=False)