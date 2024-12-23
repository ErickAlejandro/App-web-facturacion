# Generated by Django 5.1.4 on 2024-12-10 22:56

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='access_login_sii',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('ruc', models.CharField(max_length=13, unique=True)),
                ('telefono1', models.CharField(blank=True, max_length=15, null=True)),
                ('direccion1', models.TextField(blank=True, null=True)),
                ('nombre', models.CharField(max_length=100)),
                ('bandcliente', models.BooleanField(default=False)),
                ('bandproveedor', models.BooleanField(default=False)),
                ('password', models.CharField(max_length=128)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('estado', models.BooleanField(default=True)),
            ],
        ),
    ]