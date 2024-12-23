from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
# Importacion de la base de datos
from billing.connection_data_bases import connection_db
from billing.connection_data_bases import consult_bd
from billing.connection_data_bases import get_product
from billing.connection_data_bases import get_trans
from billing.connection_data_bases import get_empresa
from billing.connection_data_bases import get_existencias
from billing.connection_data_bases import send_trama
import json
import os
from billing.models import access_login_sii
from django.shortcuts import redirect
from django.core.mail import send_mail

def login_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.session.get('is_authenticated'):
            return redirect('/login/')
        return view_func(request, *args, **kwargs)
    return wrapper

# Create your views here.
def base(request):
    return render(request, 'base.html')

def page_home(request):
    user_data = {}
    trans_data = {"error": "No se pudo obtener los datos"}
    
    if not request.user.is_authenticated:
        user_id = request.session.get('user_id')
        
        if user_id:
            try:
                user = access_login_sii.objects.get(id=user_id)
                user_data = {
                    'id': user.id,
                    'ruc': user.ruc,
                    'telefono': user.telefono1,
                    'direccion': user.direccion1,
                    'nombre': user.nombre,
                    'email': user.email,
                    'idClientSii4': user.idClienteSii4,
                }
            except access_login_sii.DoesNotExist:
                # Si no se encuentra el usuario, user_data sigue vacío
                pass
        
        # Obtener transacciones (ajusta get_trans según tu implementación)
        trans_data = get_trans(as_dict=True)
        if isinstance(trans_data, JsonResponse):
            trans_data = trans_data.content
            trans_data = json.loads(trans_data)
        else:
            trans_data = {"error": "No se pudo obtener los datos"}
    else:
        # Si el usuario está autenticado, puedes agregar lógica adicional aquí
        pass
    
    # Convertir datos a JSON
    trans_data_json = json.dumps(trans_data)
    context = {'trans_data': trans_data_json, 'user_data': json.dumps(user_data)}
    
    return render(request, 'pageHome.html', context)

@login_required   
def view_fact(request):
    trans_data = get_trans(as_dict=True)
    user_id = request.session.get('user_id')
    user = access_login_sii.objects.get(id=user_id)
    user_data = {
        'id': user.id,
        'ruc': user.ruc,
        'telefono': user.telefono1,
        'direccion': user.direccion1,
        'nombre': user.nombre,
        'email': user.email,
        'idClientSii4': user.idClienteSii4,
    }
    
    if isinstance(trans_data, JsonResponse):
        trans_data = trans_data.content
        trans_data = json.loads(trans_data)
    else:
        trans_data = {"error": "No se pudo obtener los datos"}
        
    trans_data_json = json.dumps(trans_data)
    context = {'trans_data': trans_data_json, 'user_data': json.dumps(user_data)}
    return render(request, 'products.html', context)

@login_required
def view_settings(request):
    trans_data = get_trans(as_dict=True)
    user_id = request.session.get('user_id')
    user = access_login_sii.objects.get(id=user_id)
    user_data = {
        'id': user.id,
        'ruc': user.ruc,
        'telefono': user.telefono1,
        'direccion': user.direccion1,
        'nombre': user.nombre,
        'email': user.email,
        'idClientSii4': user.idClienteSii4,
    }
    
    if isinstance(trans_data, JsonResponse):
        trans_data = trans_data.content
        trans_data = json.loads(trans_data)
    else:
        trans_data = {"error": "No se pudo obtener los datos"}
        
    trans_data_json = json.dumps(trans_data)
    context = {'trans_data': trans_data_json, 'user_data': json.dumps(user_data)}
    return render(request, 'settings.html', context)

@login_required
def view_enterprise(request):
    enterprise_data = get_empresa(request)
    if isinstance(enterprise_data, JsonResponse):
        enterprise_data = enterprise_data.content
        enterprise_data = json.loads(enterprise_data)
        enterprise_data = enterprise_data['response']
        
    trans_data = get_trans(as_dict=True)
    user_id = request.session.get('user_id')
    user = access_login_sii.objects.get(id=user_id)
    user_data = {
        'id': user.id,
        'ruc': user.ruc,
        'telefono': user.telefono1,
        'direccion': user.direccion1,
        'nombre': user.nombre,
        'email': user.email,
        'idClientSii4': user.idClienteSii4,
    }
    
    if isinstance(trans_data, JsonResponse):
        trans_data = trans_data.content
        trans_data = json.loads(trans_data)
    else:
        trans_data = {"error": "No se pudo obtener los datos"}
        
    trans_data_json = json.dumps(trans_data)
    context = {'trans_data': trans_data_json, 'user_data': json.dumps(user_data), 'enterprise_data': json.dumps(enterprise_data)}
    return render(request, 'enterprise.html', context)

def login(request):
    return render(request, 'login.html')

# Funcion para poder crear un nuevo registro de accesos para la base de datos interna
@csrf_exempt
def create_new_access_sii4(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ruc = data.get('ruc')
            telefono1 = data.get('telefono1', '')
            direccion1 = data.get('direccion1', '')
            nombre = data.get('nombre', '')
            bandcliente = data.get('bandcliente', '0')
            bandproveedor = data.get('bandproveedor', '0')
            email = data.get('email', '')
            estado = data.get('estado', 0)
            idClientSii4 = data.get('idClienteSii4', '')

            if not email:
                return JsonResponse({'error': 'El correo electrónico es obligatorio'}, status=400)

            bandcliente = True if bandcliente == '1' else False
            bandproveedor = True if bandproveedor == '1' else False
            estado = True if estado == '1' else False

            # Aquí puedes procesar los datos, como guardarlos en la base de datos ------------------------------
            # Crear el password a partir del primer nombre y los primeros 5 caracteres del RUC
            first_word_name = nombre.split()[0] if nombre else 'default'
            password = first_word_name + ruc[:5]
            # print(ruc, telefono1, direccion1, nombre, bandcliente, bandproveedor, email, estado, password)
            access_login = access_login_sii(
                ruc=ruc,
                telefono1=telefono1,
                direccion1=direccion1,
                nombre=nombre,
                bandcliente=bandcliente,
                bandproveedor=bandproveedor,
                password=password,
                email=email,
                estado=estado,
                idClienteSii4=idClientSii4
            )
            access_login.save()

            subject = "Acceso creado con éxito"
            message = (
                f"Hola {nombre},\n\n"
                f"Tu cuenta ha sido creada exitosamente.\n\n"
                f"RUC: {ruc}\n"
                f"Contraseña: {password}\n\n"
                f"Por favor, utiliza estas credenciales para acceder al sistema en la dirección (Aún por definir).\n\n"
                f"Saludos,\nEquipo de soporte de Ishida Software para Almacenes Ávila."
            )
            from_email = os.getenv('EMAIL_HOST_USER')
            recipient_list = [email]

            try:
                send_mail(subject, message, from_email, recipient_list)
            except Exception as e:
                return JsonResponse({'error': f'No se pudo enviar el correo: {str(e)}'}, status=500)

            # Retornar respuesta al frontend
            return JsonResponse({'message': 'Accesos guardados correctamente', 'status': 'success'}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Error al decodificar JSON'}, status=400)

# Creación del Login para acceder a las funciones de la pagina
@csrf_exempt
def login_access(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            correo_ruc = data.get('correo_ruc')
            password = data.get('password')
            user = access_login_sii.objects.filter(email=correo_ruc).first() or \
                   access_login_sii.objects.filter(ruc=correo_ruc).first()
            
            if user and user.password == password:
                request.session['user_id'] = user.id
                request.session['is_authenticated'] = True
                request.session['email'] = user.email
                return JsonResponse({'message': 'Inicio de sesión exitoso', 'status': 'success'}, status=200)
            else:
                return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Error al decodificar JSON'}, status=400)

@login_required     
def logout_access(request):
    request.session.flush()
    return redirect('/login/')

