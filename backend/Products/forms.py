from django import forms
import os

class ProductsForm(forms.Form):
    
    Name = forms.CharField()
    Price = forms.DecimalField()
    Costs = forms.DecimalField()
    Description = forms.CharField()
    Image = forms.ImageField()
    InStock = forms.IntegerField()

    def clean_Image(self):
        image = self.cleaned_data['Image']
        
        if image:
            # Извлекаем расширение файла
            extension = os.path.splitext(image.name)[1].lower()  # Получаем расширение файла
            if extension not in ['.png', '.jpg', '.jpeg']:
                raise forms.ValidationError("Допустимые форматы файлов: PNG, JPG, JPEG.")
        return image
    

class ProductUpdateForm(forms.Form):
    product_id = forms.IntegerField()
    Name = forms.CharField(required=False, empty_value=None)
    Price = forms.DecimalField(required=False, min_value=0)  # Prevent negative prices
    Costs = forms.DecimalField(required=False, min_value=0)  # Prevent negative costs
    Description = forms.CharField(required=False, empty_value=None)
    Image = forms.ImageField(required=False)
    InStock = forms.IntegerField(required=False, min_value=0) 

    def clean_Image(self):
        image = self.cleaned_data['Image']
        
        if image:
            # Извлекаем расширение файла
            extension = os.path.splitext(image.name)[1].lower()  # Получаем расширение файла
            if extension not in ['.png', '.jpg', '.jpeg']:
                raise forms.ValidationError("Допустимые форматы файлов: PNG, JPG, JPEG.")
        return image