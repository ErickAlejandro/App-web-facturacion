from django.db import models

# Create your models here.
class access_login_sii(models.Model):
    id = models.AutoField(primary_key=True)  
    ruc = models.CharField(max_length=13, unique=True) 
    telefono1 = models.CharField(max_length=15, blank=True, null=True) 
    direccion1 = models.TextField(blank=True, null=True) 
    nombre = models.CharField(max_length=100) 
    bandcliente = models.BooleanField(default=False) 
    bandproveedor = models.BooleanField(default=False)
    password = models.CharField(max_length=128)
    email = models.EmailField(unique=True)
    estado = models.BooleanField(default=True)
    idClienteSii4 = models.TextField(blank=True, null=True)

class settings(models.Model):
    id = models.AutoField(primary_key=True)
    property = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
