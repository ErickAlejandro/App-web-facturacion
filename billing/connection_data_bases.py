import os
from dotenv import load_dotenv
import pyodbc
# Importaciones para las consultas
import requests

from billing.models import access_login_sii
from django.core.exceptions import ObjectDoesNotExist

from django.http import JsonResponse
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
import json
from fnmatch import fnmatch

# Conexion directa con la base de datos
def connection_db(base):
    try:
        load_dotenv()
        # Parametros Generales de la base de datos
        db_host = os.getenv('HOST_DB')
        db_username = os.getenv('USER_DB')
        db_password = os.getenv('PASSWORD_DB')

        if base == 'main':
            # Conexion de las diferentes bases de datos ---------------------------------------------------------
            db_main = os.getenv('MAIN_DB_NAME')
            conn_main = pyodbc.connect(
                f'DRIVER={{ODBC Driver 17 for SQL Server}};'
                f'SERVER={db_host};'
                f'DATABASE={db_main};'
                f'UID={db_username};'
                f'PWD={db_password}'
            )
            cursor_main = conn_main.cursor()
            # Consultas para la base de datos MAIN
            cursor_main.execute("SELECT * FROM Usuario")

            rows = cursor_main.fetchall()
            results_main = [dict(zip([column[0] for column in cursor_main.description], row)) for row in rows]
            cursor_main.close()
            conn_main.close()
            return results_main
        
        # Si la base de datos es de la empresa ---------------------------------------------------------------------
        if base == 'enterprise':
            db_enterprise = os.getenv('EMPRESA_DB_NAME')
            conn_enterprise = pyodbc.connect(
                f'DRIVER={{ODBC Driver 17 for SQL Server}};'
                f'SERVER={db_host};'
                f'DATABASE={db_enterprise};'
                f'UID={db_username};'
                f'PWD={db_password}'
            )
            cursor_enterprise = conn_enterprise.cursor()
            # Consultas de la base de datos de la Empresa
            cursor_enterprise.execute("SELECT * FROM GNTrans")

            rows = cursor_enterprise.fetchall()
            results_enterprise = [dict(zip([column[0] for column in cursor_enterprise.description], row)) for row in rows]
            cursor_enterprise.close()
            conn_enterprise.close()
            return results_enterprise

    except pyodbc.Error as e:
        # Manejo de errores
        return JsonResponse({'error': str(e)}, status=500)

# Conexion por medio del API
def consult_bd(request, mail_ruc):
    try:
        load_dotenv()
        ip = os.getenv('DIR_IP')
        port = os.getenv('PORT_IP')
        ip_val = os.getenv('DIR_IP_VALIDATIONS')
        route_us = os.getenv('ROUTE_USERS')
        clave_acc = os.getenv('CLAVE_ACCESO_SII4')
        token_valido = os.getenv('KEY_TOKEN')

        token_enviado = request.headers.get('Authorization')
        
        if token_enviado != token_valido:
            return JsonResponse({"error": "Token de establecido y el del API no coinciden."}, status=401)

        url = f'{ip}:{port}{ip_val}{route_us}{clave_acc}/{mail_ruc}'
        headers = {
            'Authorization': f'{token_valido}'
        }
        response = requests.get(url, headers=headers)
        
        # Busqueda en la tabla 
        try:
            registro = access_login_sii.objects.filter(ruc=mail_ruc)
            registros_json = serializers.serialize('json', registro)
        except ObjectDoesNotExist:
            registros_json = None
        
        context = {'coincidencias': registros_json, 'response': response.json()}

        if response.status_code == 200:
            return JsonResponse(context, safe=False)
        else:
            return JsonResponse({"error": "Error al consultar la API externa"}, status=500)    
        
    except pyodbc.Error as e:
        return JsonResponse({'error': str(e)}, status=500)
    

def get_product(request, product):
    try:
        load_dotenv()
        ip = os.getenv('DIR_IP')
        port = os.getenv('PORT_IP')
        ip_val = os.getenv('DIR_IP_VALIDATIONS')
        ip_product = os.getenv('ROUTE_PRODUCTS')
        date_set = os.getenv('DATE_RESET')
        token_valido = os.getenv('KEY_TOKEN')

        token_enviado = request.headers.get('Authorization')

        if token_enviado != token_valido:
            return JsonResponse({"error": "Token de establecido y el del API no coinciden."}, status=401)

        url = f'{ip}:{port}{ip_val}{ip_product}{product}{date_set}'
        
        headers = {
            'Authorization': f'{token_valido}'
        }
        response = requests.get(url, headers=headers)

        context = {'response': response.json()}

        if response.status_code == 200:
            return JsonResponse(context, safe=False)
        else:
            return JsonResponse({"error": "Error al consultar la API externa"}, status=500) 
        
    except pyodbc.Error as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_trans(request=None, as_dict=False):
    try:
        load_dotenv()
        ip = os.getenv('DIR_IP')
        port = os.getenv('PORT_IP')
        ip_val = os.getenv('DIR_IP_VALIDATIONS')
        route_info_trans = os.getenv('ROUTE_INFO_TRANS')
        cod_trans = os.getenv('COD_TRANS')
        token_valido = os.getenv('KEY_TOKEN')

        url= f'{ip}:{port}{ip_val}{route_info_trans}{cod_trans}'

        headers = {
            'Authorization': f'{token_valido}'
        }

        response = requests.get(url, headers=headers)

        context = {'response': response.json()}

        if response.status_code == 200:
            return JsonResponse(context, safe=False)
        else:
            return JsonResponse({"error": "Error al consultar la API externa"}, status=500) 

    except pyodbc.Error as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def get_empresa(request):
    try:
        load_dotenv()
        ip = os.getenv('DIR_IP')
        port = os.getenv('PORT_IP')
        ip_val = os.getenv('DIR_IP_VALIDATIONS')
        route_enterprise = os.getenv('ROUTE_ENTERPRISE')
        token_valido = os.getenv('KEY_TOKEN')
        
        url = f'{ip}:{port}{ip_val}{route_enterprise}'
        
        headers = {
            'Authorization': f'{token_valido}'
        }
        response = requests.get(url, headers=headers)

        context = {'response': response.json()}

        if response.status_code == 200:
            return JsonResponse(context, safe=False)
        else:
            return JsonResponse({"error": "Error al consultar la API externa"}, status=500) 

    except pyodbc.Error as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def get_existencias(request):
    try:
        load_dotenv()
        ip = os.getenv('DIR_IP')
        port = os.getenv('PORT_IP')
        ip_val = os.getenv('DIR_IP_VALIDATIONS')
        route_existencia = os.getenv('ROUTE_EXISTENCIAS')
        token_valido = os.getenv('KEY_TOKEN')

        token_enviado = request.headers.get('Authorization')
        
        url = f'{ip}:{port}{ip_val}{route_existencia}'

        if token_enviado != token_valido:
            return JsonResponse({"error": "Token de establecido y el del API no coinciden."}, status=401)

        headers = {
            'Authorization': f'{token_valido}'
        }
        response = requests.get(url, headers=headers)

        context = {'response': response.json()}

        if response.status_code == 200:
            return JsonResponse(context, safe=False)
        else:
            return JsonResponse({"error": "Error al consultar la API externa"}, status=500) 
        
    except pyodbc.Error as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def send_trama(request, infoTrama):
    try:
        load_dotenv()
        ip = os.getenv('DIR_IP')
        port = os.getenv('PORT_IP')
        ip_val = os.getenv('DIR_IP_VALIDATIONS')
        route_trama = os.getenv('URL_CREATE_TRANS')
        token_valido = os.getenv('KEY_TOKEN')

        token_enviado = request.headers.get('Authorization')

        if token_enviado != token_valido:
            return JsonResponse({"error": "Token de establecido y el del API no coinciden."}, status=401)
        
        url = f'{ip}:{port}{ip_val}{route_trama}{infoTrama}'
        
        headers = {
            'Authorization': f'{token_valido}'
        }
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            return JsonResponse(response.json(), safe=False)
        else:
            return JsonResponse({"error": "Error al consultar la API externa"}, status=500) 
    except pyodbc.Error as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def get_printing_format(request):
    if request.method == "POST":
        try:
            # Obtener el directorio y el código de transacción desde las variables de entorno
            directory_path = os.getenv('DIRE_PRINTING_FORMAT')
            cod_trans = f"g{os.getenv('COD_TRANS')}"

            print(f"Directorio: {directory_path}, Código Transacción: {cod_trans}")

            if not os.path.exists(directory_path):
                return JsonResponse({"success": False, "message": "Directorio no encontrado."}, status=404)

            # Buscar archivos .txt que coincidan con el nombre cod_trans
            matching_files = [
                file for file in os.listdir(directory_path)
                if fnmatch(file, f"{cod_trans}*.txt")
            ]
            
            if not matching_files:
                return JsonResponse({"success": False, "message": "No se encontraron archivos coincidentes."}, status=404)
            
            matching_file = matching_files[0]
            file_path = os.path.join(directory_path, matching_file)
            with open(file_path, 'r') as file:
                file_content = file.read()
            
            return JsonResponse({
                "success": True,
                "matching_files": matching_files,
                "file_content": file_content
            })
        except Exception as e:
            return JsonResponse({"success": False, "message": f"Error inesperado: {str(e)}"}, status=500)

    return JsonResponse({"success": False, "message": "Método no permitido."}, status=405)