# Generated by Django 4.2.17 on 2024-12-26 13:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Customers', '0001_initial'),
        ('Products', '0002_products_costs_alter_products_image'),
        ('Orders', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='orders',
            name='User',
        ),
        migrations.AddField(
            model_name='orders',
            name='Customer',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='Customers.customers'),
        ),
        migrations.AddField(
            model_name='orders',
            name='DueDate',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='orders',
            name='Products',
            field=models.ManyToManyField(to='Products.products'),
        ),
    ]