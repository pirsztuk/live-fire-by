# Generated by Django 4.2.17 on 2024-12-29 16:23

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Customers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customers',
            name='CreatedAt',
            field=models.DateTimeField(auto_now_add=True, default=datetime.datetime(2024, 12, 29, 16, 23, 12, 327126)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='customers',
            name='UpdatedAt',
            field=models.DateTimeField(auto_now=True),
        ),
    ]