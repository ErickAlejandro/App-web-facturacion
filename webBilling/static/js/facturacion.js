const btnSearchProduct = document.getElementById("btnSearchProduct");
const inputProductSearch = document.getElementById("inputProductSearch");
const tbodySerchProducts = document.getElementById("tbodySerchProducts");
const tableProductSelected = document.getElementById("tableProductSelected");
const rowProductsSelecteds = document.getElementById("rowProductsSelecteds");
const rowDataFact = document.getElementById("rowDataFact");
const valorTotalCompra = document.getElementById("valorTotalCompra");
const colProductsSelecteds = document.getElementById("colProductsSelecteds");
const colProductsFilter = document.getElementById("colProductsFilter");
const numPedido = document.getElementById("numPedido");
const nombreCliente = document.getElementById("nombreCliente");
const rucCliente = document.getElementById("rucCliente");
const telefonoCliente = document.getElementById("telefonoCliente");
const emailCliente = document.getElementById("emailCliente");
const direccionCliente = document.getElementById("direccionCliente");
const btnGrabarTransaccion = document.getElementById("btnGrabarTransaccion");

const userNameLoged = document.getElementById("userNameLoged");
const userRucLoged = document.getElementById("userRucLoged");

let bandImgProduct = false,
decimales = false,
productsSelected = [],
selectedProductsMap = {},
costoCompra = 0,
transData,
userData,
tiempoEntrega=52,
formaCobro='CRÉDITO',
numeroDias=30,
documentoReferencia=1,
idVendedorPre=221;

// Traer los datos generales de la transaccion
try {
  toastr.success("Datos de la transacción y clientes obtenidos exitosamente", "Información Obtenida Exitosamente")
  transData = JSON.parse(document.getElementById("transData").textContent);
  transData = transData.response
  numPedido.textContent = `Número de Pedido: ${transData[0].numtranssiguiente}`;
  
  userData = JSON.parse(document.getElementById('userData').textContent);
  nombreCliente.textContent = `Nombre: ${userData.nombre}`;
  rucCliente.textContent = `RUC/ID: ${userData.ruc}`;
  telefonoCliente.textContent = `Teléfono: ${userData.telefono == null ? "Sin Establecer" : userData.telefono}`;
  emailCliente.textContent = `Email: ${userData.email == null ? "Sin Establecer" : userData.email}`;
  direccionCliente.textContent = `Dirección: ${userData.direccion == null ? "Sin Establecer" : userData.direccion}`;
  
  userNameLoged.textContent = userData.nombre;
  userRucLoged.textContent = userData.ruc;
} catch (error) {
  toastr.error(error, "Error en la transacción")
  console.error("Error al parsear los datos JSON:", error);
}


inputProductSearch.addEventListener("input", function () {
  var valProductSearch = inputProductSearch.value;

  if (valProductSearch != "") {
    btnSearchProduct.disabled = false;
  } else {
    btnSearchProduct.disabled = true;
  }
});

btnSearchProduct.addEventListener("click", function () {
  rowProductsSelecteds.style.display = "";
  colProductsFilter.style.display = "";
    var productSearch = inputProductSearch.value;
    
    tbodySerchProducts.innerHTML = "";
    
    if (productSearch != "" && productSearch != " ") {
    var url = `${window.location.origin}/getProduct/${productSearch}/`;
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Ishida7410."
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error en la respuesta: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // console.log("Respuesta del servidor:", data);
        var products = data.response;
        toastr.success(`Se han encontrado ${products.length} coincidencias.`, 'Productos encontrados');
        
        if(products.length != 0){
          products.forEach(function (product){
              var row = document.createElement("tr");
  
              var cellCodItem = document.createElement("td");
              cellCodItem.textContent = product.cod_item;
  
              var cellDescripcion = document.createElement("td");
              cellDescripcion.textContent = product.descripcion;
  
              var cellPrecio = document.createElement("td");
              var precioFloat = parseFloat(product.precio5);
              cellPrecio.textContent = decimales == false ? `${precioFloat} $` : `${precioFloat.toFixed(2)} $`;
  
              var cellActions = document.createElement("td");
              var checkActions = document.createElement("input");
              checkActions.type = "checkbox";
              checkActions.setAttribute('data-cod-item', product.cod_item);

              if (selectedProductsMap[product.cod_item]) {
                checkActions.checked = true;
              }
              
              // Funcionalidad del check: Al seleccionar deben guardarse en ese arreglo de objetos y al deschekear debe quitarse
              checkActions.addEventListener('change', function(){
                if (checkActions.checked) {
                  product.cantidad = 1;
                  var costoIva = (parseFloat(product.precio5) * parseFloat(product.porc_iva)) + parseFloat(product.precio5);
                  var valCostoIva = parseFloat(costoIva);
                  product.costo = decimales == false ? valCostoIva : valCostoIva.toFixed(2);
                  productsSelected.push(product);
                  selectedProductsMap[product.cod_item] = product;
              } else {
                  productsSelected = productsSelected.filter(function (item) {
                      return item.cod_item !== product.cod_item;
                  });
                  delete selectedProductsMap[product.cod_item];
              }
              // Mostrar los productos seleccionados en la pantalla de Facturación
              load_product_selected(productsSelected);
              calcularCostoCompra();
              });
              cellActions.appendChild(checkActions);
              
              row.appendChild(cellCodItem);
              row.appendChild(cellDescripcion);
              row.appendChild(cellPrecio);
              row.appendChild(cellActions);
  
              tbodySerchProducts.appendChild(row);
          });
        }else {
          var row = document.createElement('tr');
          var cell = document.createElement('td');
          cell.textContent = 'No se han encontrado coincidencias';
          cell.setAttribute('colspan', '4');
          row.appendChild(cell)
          tbodySerchProducts.appendChild(row);
        }
      })
      .catch((error) => {
        toastr.error(error, 'Error')
        console.error("Error en la consulta:", error);
      });
  } else {
    console.log('Debe buscar a todos')
    productSearch = "%";
  }
});

// Funcion para poder cargar los productos seleccionados en un contenedor
function load_product_selected(products){
  tableProductSelected.innerHTML = "";
  
  if(products.length != 0){
    products.forEach(function (product , index){
      rowProductsSelecteds.style.display = "";
      colProductsSelecteds.style.display = "";

      var rowItems = document.createElement("tr");

      var colDescription = document.createElement("td");
      colDescription.textContent = product.descripcion;

      var colCostos = document.createElement("td");
      var precioFloat = parseFloat(product.costo);
      colCostos.textContent = `${decimales == false ? precioFloat : precioFloat.toFixed(2)} $`;

      var colCantidad = document.createElement("td");
      var inputCantidad = document.createElement("input");
      inputCantidad.type = "number";
      inputCantidad.step = "0.01";
      inputCantidad.placeholder = "Ingresar la cantidad deseada";
      inputCantidad.classList = "form-control form-control-sm";
      inputCantidad.value = product.cantidad;
      // Funcionalidad del input cantidad
      inputCantidad.addEventListener('blur', function () {
        var cantidad = parseFloat(inputCantidad.value);
        if (cantidad > 0) {
          var precioTotal = precioFloat * cantidad;
          colCostos.textContent = `${decimales == false ? precioTotal : precioTotal.toFixed(2)} $`;
          product.cantidad = cantidad;
          product.costo = precioTotal;
          calcularCostoCompra();
          // Actualizar la cantidad en selectedProductsMap
          if (selectedProductsMap[product.cod_item]) {
            selectedProductsMap[product.cod_item].cantidad = cantidad;
            selectedProductsMap[product.cod_item].costo = precioTotal;
          }
        }
      });
      colCantidad.appendChild(inputCantidad);

      var colActions = document.createElement("td");
      var buttonDeleteProduct = document.createElement("button");
      buttonDeleteProduct.type = 'button';
      buttonDeleteProduct.classList = 'btn btn-sm btn-danger';
      buttonDeleteProduct.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
  <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
</svg>
`;
      // Boton para eliminar el item de la fila seleccionada
      buttonDeleteProduct.addEventListener('click', function(){
        products.splice(index, 1);
        tableProductSelected.removeChild(rowItems);
        if (products.length === 0) {
          rowProductsSelecteds.style.display = "none";
          colProductsSelecteds.style.display = "none";
        }
        var checkbox = document.querySelector(`tbody input[type="checkbox"][data-cod-item="${product.cod_item}"]`);
        if (checkbox) {
          checkbox.checked = false;
        }
        delete selectedProductsMap[product.cod_item];
        calcularCostoCompra();
      });
      colActions.appendChild(buttonDeleteProduct);
      
      rowItems.appendChild(colDescription);
      rowItems.appendChild(colCostos);
      rowItems.appendChild(colCantidad);
      rowItems.appendChild(colActions);
      tableProductSelected.appendChild(rowItems);
    })
  }else{
    rowProductsSelecteds.style.display = "none";
    colProductsSelecteds.style.display = "none";
  }
}

// Función para calcular y actualizar el costo de la compra
function calcularCostoCompra() {
  costoCompra = 0;
  productsSelected.forEach(function (product) {
    costoCompra += parseFloat(product.costo); 
  });
  // Mostrar el costo de la compra en la interfaz, si es necesario
  if(costoCompra != 0){
    rowDataFact.style.display = "";
    valorTotalCompra.textContent = `${costoCompra} $`;
  }else{
    rowDataFact.style.display = "none";
    valorTotalCompra.textContent = "0 $";
  }
}

// Funcionalidad del boton
btnGrabarTransaccion.addEventListener("click", async function(){
  toastr.info("Consultando información...", "Cargando");
  btnGrabarTransaccion.disabled = true;
  
  try{
    var urlEmpresa = `${window.location.origin}/getEmpresa/`;
    var urlTrans = `${window.location.origin}/getInfoTrans/`;
    var urlExistencias = `${window.location.origin}/getExistencias/`

    const [responseEmpresa, responseTrans, responseExistencias] = await Promise.all([
      fetch(urlEmpresa, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
      }),
      fetch(urlTrans, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
      }),
      fetch(urlExistencias, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Ishida7410."
        },
      }),
    ]);

    if (!responseEmpresa.ok || !responseTrans.ok || !responseExistencias.ok) {
      toastr.error("Error en las Solicitudes", "Error")
      throw new Error("Error en una o ambas solicitudes.");
    }else{
      toastr.success("Información de la empresa, transacción y existencias obtenidas exitosamente", "Exito")
    }

    const dataEmpresa = await responseEmpresa.json();
    const dataTrans = await responseTrans.json();
    const dataExistencias = await responseExistencias.json();

    // Construccion de la trama
    // http://192.168.1.111:81/api.validaciones.comconstru/v1/transaccion/TRANSACCION;baseDatos;trama1;2016-01-01 2012:00:00;baseDatos;Transaccion[NumTransSiguiente|OF-OFERTA|;Nombre del Cliente para Facturar con espacios;Tiempo de entrega(52);FORMA DE COBRO (6);Numero de días (30);;;;;;|Documento Referencia (1)|anio-mes-dia(Del dia de hoy)|hora:min:seg|idCliente|Id del vendedor especifico(201)|null|null|null|null|null|null|0|null|null|null|null|null|null|null|null|null|IVKardex:[{Cantidad(1.0)|Precio Unitario(10.33)|Precio Total(10.33)|Descuento(0.0)|Existencias correspondientes con los items seleccinoados y relacionados(B01)|Id del Inventario(49924)|null|Opciones de la transaccion(0)|Precio predefinido en informacion de Transaccion(5)||Opciones de la transaccion(0)|}]|PCKardex:[]]

    var codBaseDatos = dataEmpresa.response;
    var infoTrans = dataTrans.response;
    var infoExistencias = dataExistencias.response;
    
    // Obtener la fechaActual
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toTimeString().split(' ')[0];
    
    var productsTrama = productsSelected.map(product => {
      return {
        cantidad: product.cantidad,
        precioUnitario: parseFloat(product.precio5),
        costoTotal: product.costo,
        descuento: 0.0,
        idInventario: product.identificador,
        unknowVal: null,
        estado: product.estado,
        precioPre: infoTrans[0].preciopre,
        opciones: infoTrans[0].opciones,
      };
    });
    const updatedProductsTrama = productsTrama.map(product => {
      const match = infoExistencias.find(existencia => existencia.inventario_id == product.idInventario);
      return {
        ...product,
        bodega_id: match ? match.bodega_id : null
      };
    })
    const cadenaTrama = `[${updatedProductsTrama.map(product => {
      return `{${product.cantidad.toFixed(1)}|${product.precioUnitario.toFixed(2)}|${product.costoTotal.toFixed(2)}|${product.descuento.toFixed(1)}|B01|${product.idInventario}|${product.bodega_id ?? "null"}|0|5||0|}`;
      }).join(',')}]`;
      
    var infoTrama = `${codBaseDatos[0].nombrebase};trama1;2016-01-01%202012:00:00;${codBaseDatos[0].nombrebase};Transaccion[${infoTrans[0].numtranssiguiente}|${infoTrans[0].codtrans}-${infoTrans[0].codtrans == 'OF' ? 'OFERTA' : infoTrans[0].descripcion}|;${userData.nombre};${tiempoEntrega};${formaCobro};${numeroDias};;;;;;|${documentoReferencia}|${formattedDate}|${formattedTime}|${userData.idClientSii4}|${idVendedorPre}|null|null|null|null|null|null|0|null|null|null|null|null|null|null|null|null|IVKardex:${cadenaTrama}|PCKardex:[]`;
    var urlSendTrama = `${window.location.origin}/sendTrama/${infoTrama}`;
    
    const responseSendTrama = await fetch(urlSendTrama, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Ishida7410."
      },
    });

    if (!responseSendTrama.ok) {
      toastr.error("Error al enviar la trama", "Error");
      throw new Error("Error al enviar la trama.");
    } else {
      const resultSendTrama = await responseSendTrama.json();
    
      if (resultSendTrama.estado) {
        toastr.success(resultSendTrama.estado, "Transacción grabada exitosamente.");
      } else {
        toastr.error("No se recibió el estado esperado", "Error");
      }
    }

  }catch (error) {
        // Manejo de errores
        console.error("Error:", error);
        toastr.error(error, "Error")
    }
});