# Generated by Django 5.1.4 on 2024-12-20 21:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0002_access_login_sii_idclientesii4'),
    ]

    operations = [
        migrations.CreateModel(
            name='settings',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('property', models.CharField(max_length=100)),
                ('value', models.CharField(max_length=100)),
            ],
        ),
    ]