# Documentación de la Aplicación: Login y Pantalla de Facturación

## Prerrequisitos

### Configuración del Entorno Virtual
Para garantizar un entorno de desarrollo aislado y bien configurado, sigue los pasos a continuación:

1. **Instalar Python:**
   - Asegúrate de tener instalado Python (versión 3.8 o superior).
   - Puedes descargarlo desde [python.org](https://www.python.org/).

2. **Crear un Entorno Virtual:**
   - Abre una terminal o consola en tu sistema operativo.
   - Navega al directorio donde deseas crear el entorno virtual.
   - Ejecuta el siguiente comando:
     ```bash
     python -m venv venv
     ```
   - Esto creará un entorno virtual llamado `venv`.

3. **Activar el Entorno Virtual:**
   - En **Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - En **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
   - Una vez activado, deberías ver el nombre del entorno virtual al inicio de tu terminal.

4. **Actualizar `pip`:**
   - Antes de instalar dependencias, asegúrate de tener la última versión de `pip`:
     ```bash
     pip install --upgrade pip
     ```

### Instalación de Dependencias
Una vez que el entorno virtual está activo, instala las dependencias necesarias:

1. **Archivo `requirements.txt`:**
   - Asegúrate de que el archivo `requirements.txt` esté en el directorio raíz del proyecto.

2. **Instalar Dependencias:**
   - Ejecuta el siguiente comando para instalar las bibliotecas necesarias:
     ```bash
     pip install -r requirements.txt
     ```

3. **Verificar la Instalación:**
   - Para confirmar que todas las dependencias se instalaron correctamente, puedes listar los paquetes instalados:
     ```bash
     pip freeze
     ```

---

## Frontend

### 1. Login

#### Funcionalidad
El sistema de login está diseñado para verificar la identificación del usuario en diferentes bases de datos y actuar de acuerdo con los resultados. A continuación, se detalla el proceso:

1. **Ingreso de Identificación:**
   - El usuario ingresa su número de identificación en el campo correspondiente.

2. **Verificación en Bases de Datos:**
   - **Base de datos interna de Django:**
     - Si la identificación se encuentra registrada:
       - Se muestra un mensaje indicando que las credenciales ya fueron creadas.
       - Se solicita al usuario verificar su correo para acceder a las mismas.
   - **Base de datos externa del Sistema Sii4:**
     - Si la identificación se encuentra en esta base de datos:
       - Se ofrece la opción de importar los datos.
       - Una vez importados, se crean las credenciales correspondientes.
   - **Caso de no coincidencia:**
     - Si la identificación no se encuentra en ninguna de las bases de datos:
       - Se muestra un mensaje indicando que el usuario debe comunicarse con el proveedor para crear las credenciales.

3. **Acceso Correcto:**
   - Si todo está correcto con respecto a los accesos:
     - El usuario es dirigido automáticamente a la pantalla de facturación.

### 2. Pantalla de Facturación

#### Descripción General
- Esta pantalla es el punto central donde el usuario realiza las operaciones relacionadas con la facturación.
- **Funcionalidades clave:**
  - Creación, edición y envío de facturas.
  - Gestión de facturas existentes.
  - Acceso a reportes y estadísticas relacionadas con la facturación.

#### Requisitos
- Acceso permitido solo a usuarios con credenciales válidas.
- Diseño intuitivo y funcional para facilitar las operaciones de facturación.

#### Flujo de Trabajo
1. El usuario accede a la pantalla de facturación tras un login exitoso.
2. Se le presentan las opciones disponibles de acuerdo a su rol y permisos.
3. Puede gestionar facturas existentes o crear nuevas facturas.

### 3. Vista de Facturación

#### Funcionalidad
La vista de facturación permite al usuario buscar productos, seleccionarlos y generar una oferta en formato PDF. A continuación, se describen los pasos principales:

1. **Búsqueda de Productos:**
   - El usuario ingresa el nombre de un producto en un campo de entrada.
   - Al hacer clic en el botón "Buscar Producto", se genera una lista de productos relacionados.

2. **Selección de Productos:**
   - Cada producto en la lista tiene un checkbox asociado.
   - El usuario selecciona un producto haciendo clic en el checkbox correspondiente.
   - El producto seleccionado se agrega a una tabla en el lado izquierdo de la vista.

3. **Gestión de Cantidades:**
   - En la tabla, el usuario puede modificar la cantidad de cada producto agregado.

4. **Generación de Oferta:**
   - Al hacer clic en el botón "Grabar":
     - Se genera un archivo PDF con la oferta.
     - La oferta se envía automáticamente al correo del usuario.

---

## Backend

### Estructura y Funcionalidad
El backend está diseñado para manejar las operaciones críticas de la aplicación. Su funcionamiento se detalla a continuación:

#### 1. Gestión del Login
- Existe un archivo llamado `connection_data_base.py` que contiene:
  - Las conexiones a las bases de datos.
  - Las consultas necesarias para verificar la información del usuario.
- Este archivo se conecta con `views.py` de la aplicación `billing`, que:
  - Realiza los procesos de consulta requeridos en cada pantalla.
  - Maneja las solicitudes de los usuarios mediante las rutas definidas en `urls.py`.

#### 2. Métodos Disponibles
- **Información de la Empresa:**
  - Recupera y carga los datos relacionados con la empresa del usuario.
- **Información de la Transacción:**
  - Carga los detalles específicos de cada transacción.
- **Información del Usuario para Facturación:**
  - Obtiene los datos del usuario necesarios para realizar la facturación.

#### 3. Procesos
- **Grabar Transacción:**
  - Guarda los detalles de la transacción en la base de datos.
  - Asegura que los datos estén correctamente almacenados para futuras referencias.

---

**Nota:** La integración entre el frontend y el backend se asegura mediante las rutas y procesos definidos, garantizando una experiencia de usuario fluida y un manejo eficiente de los datos.

