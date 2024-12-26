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