const btnSearchProduct = document.getElementById("btnSearchProduct");
const inputProductSearch = document.getElementById("inputProductSearch");
const tbodySerchProducts = document.getElementById("tbodySerchProducts");
const tableProductSelected = document.getElementById("tableProductSelected");
const rowProductsSelecteds = document.getElementById("rowProductsSelecteds");
const rowDataFact = document.getElementById("rowDataFact");
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
  tiempoEntrega = 52,
  formaCobro = "CRÉDITO",
  numeroDias = 30,
  documentoReferencia = 1,
  idVendedorPre = 221;
  
function getCSRFToken() {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

// Traer los datos generales de la transaccion
try {
  toastr.success(
    "Datos de la transacción y clientes obtenidos exitosamente",
    "Información Obtenida Exitosamente"
  );
  transData = JSON.parse(document.getElementById("transData").textContent);
  transData = transData.response;
  numPedido.textContent = `Número de Pedido: ${transData[0].numtranssiguiente}`;

  userData = JSON.parse(document.getElementById("userData").textContent);
  console.log(userData)
  console.log(transData)
  nombreCliente.textContent = `Nombre: ${userData.nombre}`;
  rucCliente.textContent = `RUC/ID: ${userData.ruc}`;
  telefonoCliente.textContent = `Teléfono: ${
    userData.telefono == null ? "Sin Establecer" : userData.telefono
  }`;
  emailCliente.textContent = `Email: ${
    userData.email == null ? "Sin Establecer" : userData.email
  }`;
  direccionCliente.textContent = `Dirección: ${
    userData.direccion == null ? "Sin Establecer" : userData.direccion
  }`;

  userNameLoged.textContent = userData.nombre;
  userRucLoged.textContent = userData.ruc;
} catch (error) {
  toastr.error(error, "Error en la transacción");
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
        Authorization: "Ishida7410.",
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
        toastr.success(
          `Se han encontrado ${products.length} coincidencias.`,
          "Productos encontrados"
        );

        if (products.length != 0) {
          products.forEach(function (product) {
            var row = document.createElement("tr");

            var cellCodItem = document.createElement("td");
            cellCodItem.textContent = product.cod_item;

            var cellDescripcion = document.createElement("td");
            cellDescripcion.textContent = product.descripcion;

            var cellActions = document.createElement("td");
            var checkActions = document.createElement("input");
            checkActions.type = "checkbox";
            checkActions.setAttribute("data-cod-item", product.cod_item);

            if (selectedProductsMap[product.cod_item]) {
              checkActions.checked = true;
            }

            // Funcionalidad del check: Al seleccionar deben guardarse en ese arreglo de objetos y al deschekear debe quitarse
            checkActions.addEventListener("change", function () {
              if (checkActions.checked) {
                product.cantidad = 1;
                var costoIva =
                  parseFloat(product.precio7) * parseFloat(product.porc_iva) +
                  parseFloat(product.precio7);
                var valCostoIva = parseFloat(costoIva);
                product.costo =
                  decimales == false ? valCostoIva : valCostoIva.toFixed(2);
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
            row.appendChild(cellActions);

            tbodySerchProducts.appendChild(row);
          });
        } else {
          var row = document.createElement("tr");
          var cell = document.createElement("td");
          cell.textContent = "No se han encontrado coincidencias";
          cell.setAttribute("colspan", "4");
          row.appendChild(cell);
          tbodySerchProducts.appendChild(row);
        }
      })
      .catch((error) => {
        toastr.error(error, "Error");
        console.error("Error en la consulta:", error);
      });
  } else {
    console.log("Debe buscar a todos");
    productSearch = "%";
  }
});

// Funcion para poder cargar los productos seleccionados en un contenedor
function load_product_selected(products) {
  tableProductSelected.innerHTML = "";

  if (products.length != 0) {
    products.forEach(function (product, index) {
      rowProductsSelecteds.style.display = "";
      colProductsSelecteds.style.display = "";

      var rowItems = document.createElement("tr");

      var colDescription = document.createElement("td");
      colDescription.textContent = product.descripcion;

      var precioFloat = parseFloat(product.costo);

      var colCantidad = document.createElement("td");
      var inputCantidad = document.createElement("input");
      inputCantidad.type = "number";
      inputCantidad.step = "0.01";
      inputCantidad.placeholder = "Ingresar la cantidad deseada";
      inputCantidad.classList = "form-control form-control-sm";
      inputCantidad.value = product.cantidad;
      // Funcionalidad del input cantidad
      inputCantidad.addEventListener("blur", function () {
        var cantidad = parseFloat(inputCantidad.value);
        if (cantidad > 0) {
          var precioTotal = precioFloat * cantidad;
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
      buttonDeleteProduct.type = "button";
      buttonDeleteProduct.classList = "btn btn-sm btn-danger";
      buttonDeleteProduct.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
  <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
</svg>
`;
      // Boton para eliminar el item de la fila seleccionada
      buttonDeleteProduct.addEventListener("click", function () {
        products.splice(index, 1);
        tableProductSelected.removeChild(rowItems);
        if (products.length === 0) {
          rowProductsSelecteds.style.display = "none";
          colProductsSelecteds.style.display = "none";
        }
        var checkbox = document.querySelector(
          `tbody input[type="checkbox"][data-cod-item="${product.cod_item}"]`
        );
        if (checkbox) {
          checkbox.checked = false;
        }
        delete selectedProductsMap[product.cod_item];
        calcularCostoCompra();
      });
      colActions.appendChild(buttonDeleteProduct);

      rowItems.appendChild(colDescription);
      rowItems.appendChild(colCantidad);
      rowItems.appendChild(colActions);
      tableProductSelected.appendChild(rowItems);
    });
  } else {
    rowProductsSelecteds.style.display = "none";
    colProductsSelecteds.style.display = "none";
  }
}

// Función para calcular y actualizar el costo de la compra
function calcularCostoCompra() {
  // Esta variable sirve en general como el valor total de la compra
  costoCompra = 0;
  productsSelected.forEach(function (product) {
    costoCompra += parseFloat(product.costo);
  });
  // Mostrar el costo de la compra en la interfaz, si es necesario
  if (productsSelected.length != 0) {
    rowDataFact.style.display = "";
  } else {
    rowDataFact.style.display = "none";
  }
}

// Funcionalidad del boton
btnGrabarTransaccion.addEventListener("click", async function () {
  toastr.info("Consultando información...", "Cargando");
  btnGrabarTransaccion.disabled = true;

  try {
    var urlEmpresa = `${window.location.origin}/getEmpresa/`;
    var urlTrans = `${window.location.origin}/getInfoTrans/`;
    var urlExistencias = `${window.location.origin}/getExistencias/`;

    const [responseEmpresa, responseTrans, responseExistencias] =
      await Promise.all([
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
            Authorization: "Ishida7410.",
          },
        }),
      ]);

    if (!responseEmpresa.ok || !responseTrans.ok || !responseExistencias.ok) {
      toastr.error("Error en las Solicitudes", "Error");
      throw new Error("Error en una o ambas solicitudes.");
    } else {
      toastr.success(
        "Información de la empresa, transacción y existencias obtenidas exitosamente",
        "Exito"
      );
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
    const formattedDate = now.toISOString().split("T")[0];
    const formattedTime = now.toTimeString().split(" ")[0];

    var productsTrama = productsSelected.map((product) => {
      return {
        cantidad: product.cantidad,
        precioUnitario: parseFloat(product.precio7),
        costoTotal: product.costo,
        descuento: 0.0,
        idInventario: product.identificador,
        unknowVal: null,
        estado: product.estado,
        precioPre: infoTrans[0].preciopre,
        opciones: infoTrans[0].opciones,
      };
    });
    const updatedProductsTrama = productsTrama.map((product) => {
      const match = infoExistencias.find(
        (existencia) => existencia.inventario_id == product.idInventario
      );
      return {
        ...product,
        bodega_id: match ? match.bodega_id : null,
      };
    });
    const cadenaTrama = `[${updatedProductsTrama
      .map((product) => {
        return `{${product.cantidad.toFixed(
          1
        )}|${product.precioUnitario.toFixed(2)}|${product.costoTotal.toFixed(
          2
        )}|${product.descuento.toFixed(1)}|B01|${product.idInventario}|${
          product.bodega_id ?? "null"
        }|0|5||0|}`;
      })
      .join(",")}]`;

    var infoTrama = `${
      codBaseDatos[0].nombrebase
    };trama1;2016-01-01%202012:00:00;${
      codBaseDatos[0].nombrebase
    };Transaccion[${infoTrans[0].numtranssiguiente}|${infoTrans[0].codtrans}-${
      infoTrans[0].codtrans == "OF" ? "OFERTA" : infoTrans[0].descripcion
    }|;${
      userData.nombre
    };${tiempoEntrega};${formaCobro};${numeroDias};;;;;;|${documentoReferencia}|${formattedDate}|${formattedTime}|${
      userData.idClientSii4
    }|${idVendedorPre}|null|null|null|null|null|null|0|null|null|null|null|null|null|null|null|null|IVKardex:${cadenaTrama}|PCKardex:[]`;
    var urlSendTrama = `${window.location.origin}/sendTrama/${infoTrama}`;

    const responseSendTrama = await fetch(urlSendTrama, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Ishida7410.",
      },
    });

    if (!responseSendTrama.ok) {
      toastr.error("Error al enviar la trama", "Error");
      throw new Error("Error al enviar la trama.");
    } else {
      const resultSendTrama = await responseSendTrama.json();

      if (resultSendTrama.estado) {
        toastr.success(
          resultSendTrama.estado,
          "Transacción grabada exitosamente."
        );
        var urlGetFormatPrinting = "/getFormatImpresion/";
        const csrfToken = getCSRFToken();

        fetch(urlGetFormatPrinting, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({}),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Error HTTP! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            if (data.success) {
              var formatoConfig,
                campos = [],
                secciones = [];
              // Traer la configuracion de la hoja A4
              const formatoRegex = /<FORMATO\b([^>]*)>/i;
              const matchConf = data.file_content.match(formatoRegex);
              const formatoAttributes = matchConf[1].trim();
              if (matchConf) {
                formatoConfig = {};
                formatoAttributes.split(";").forEach((attr) => {
                  const [key, value] = attr
                    .split("=")
                    .map((item) => item.trim());
                  if (key && value) {
                    formatoConfig[key] = value.replace(/["']/g, ""); // Quitar comillas si existen
                  }
                });
              }
              // Informacion del resto del archivo, de aqui saldra el cuerpo de toda la factura dependiendo a lo que se necesite
              const formatoImpresion = /<CAMPO \b([^>]*)>/g;
              const matchesImpresion = [
                ...data.file_content.matchAll(formatoImpresion),
              ];
              matchesImpresion.forEach((match, index) => {
                const atributos = match[1].split(";").map((attr) => {
                  const [key, value] = attr
                    .split("=")
                    .map((item) => item.trim());
                  return { key, value: value.replace(/["']/g, "") }; // Limpiar comillas
                });
                campos.push({ index, atributos });
              });

              const seccionRegex = /<SECCION\b([^>]*)>([\s\S]*?)<\/SECCION>/g;
              const matchesSeccion = [
                ...data.file_content.matchAll(seccionRegex),
              ];
              matchesSeccion.forEach((match, index) => {
                // Extraer atributos de la sección
                const seccionAtributos = match[1].split(";").map((attr) => {
                  const [key, value] = attr
                    .split("=")
                    .map((item) => item.trim());
                  return { key, value: value.replace(/["']/g, "") }; // Limpiar comillas
                });

                // Extraer columnas dentro de la sección
                const columnas = [];
                const columnaRegex = /<COLUMNA\b([^>]*)\/>/g;
                const matchesColumnas = [...match[2].matchAll(columnaRegex)];
                matchesColumnas.forEach((colMatch) => {
                  const columnaAtributos = colMatch[1]
                    .split(";")
                    .map((attr) => {
                      const [key, value] = attr
                        .split("=")
                        .map((item) => item.trim());
                      return { key, value: value.replace(/["']/g, "") }; // Limpiar comillas
                    });
                  columnas.push(columnaAtributos);
                });

                // Guardar la sección con sus columnas
                secciones.push({
                  index,
                  atributos: seccionAtributos,
                  columnas,
                });
              });

              // Imprimir el documento PDF
              generarDocumento(formatoConfig, campos, secciones);
            } else {
              toastr.error(data.message, "Error");
            }
          })
          .catch((error) => {
            toastr.error(error, "Error en la consulta");
          });
      } else {
        toastr.error("No se recibió el estado esperado", "Error");
      }
    }
  } catch (error) {
    // Manejo de errores
    console.error("Error:", error);
    toastr.error(error, "Error");
  }
});

function generarDocumento(formatoConfig, campos, secciones) {
  // console.log('SECCIONES', secciones)
  const { PDFDocument, rgb } = PDFLib;

  PDFDocument.create().then(async (pdfDoc) => {
    var sizePage;

    // Ajustes de la pagina general
    switch (formatoConfig.TamañoPapel) {
      case 'A4':
        sizePage = [595, 842]
        break;
    }
    const page = pdfDoc.addPage(sizePage);
    const { width, height } = page.getSize();
    const procesados = new Set();

    campos.forEach((campo, index) => {
      const atributos = campo.atributos;
      const nombreCampo = atributos[0].value;
      if (procesados.has(nombreCampo)) {
        return;
      }
      
      procesados.add(nombreCampo);
      console.log(atributos)
      console.log(nombreCampo)
      switch (nombreCampo) {
        // case "LOGOEMPRESA":
        //   var posX = parseFloat(atributos[1].value); 
        //   var posY = height - parseFloat(atributos[2].value);
        //   var width = parseFloat(atributos[3].value) * 2.5; 
        //   var heightRect = parseFloat(atributos[4].value) * 2;
        //   page.drawRectangle({
        //     x: (posX * 0.1),
        //     y: (posY * 1.5) - heightRect,
        //     width: width,
        //     height: heightRect,
        //     borderColor: rgb(0, 0, 0), 
        //     borderWidth: 1, 
        //   });
        //   break
        case "RUC: ":
          var posX = parseFloat(atributos[2].value); 
          var posY = parseFloat(atributos[3].value);
          var fontSize = parseFloat(atributos[5]?.value) || 12;
          // page.drawText(`RUC:`, {
          //   x: (posX  * 4),
          //   y: (posY  * 25),
          //   size: (fontSize * 0.8),
          //   color: rgb(0, 0, 0), 
          // });
          // page.drawText(`Ruc de la empresa`, {
          //   x: (posX * 6),
          //   y: (posY * 25),
          //   size: (fontSize * 0.8),
          //   color: rgb(0, 0, 0), 
          // });
          page.drawText(`RUC`, {
            x: (posX * 27.63),
            y: (posY * 23.7),
            size: (fontSize * 0.8),
            color: rgb(0, 0, 0), 
          });
          page.drawText(`${userData.ruc}`, {
            x: (posX * 30.8),
            y: (posY * 23.7),
            size: (fontSize * 0.9),
            color: rgb(0, 0, 0), 
          });
          break
        case "PROFORMA No.":
          var posX = parseFloat(atributos[1].value) * 4; 
          var posY = parseFloat(atributos[2].value) * 19;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`PROFORMA No. `, {
            x: posX,
            y: posY,
            size: (fontSize * 0.8),
            color: rgb(0, 0, 0), 
          });
          break
        case "NUMTRANS":
          var posX = parseFloat(atributos[1].value) * 2.5; 
          var posY = parseFloat(atributos[2].value) * 19;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`${transData[0].numtranssiguiente}`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.8),
            color: rgb(0, 0, 0), 
          });
          break
        case "FECHA":
          var posX = parseFloat(atributos[1].value) * 4; 
          var posY = parseFloat(atributos[2].value) * 16.5;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`FECHA`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.5),
            color: rgb(0, 0, 0), 
          });
          break
        case "FECHATRANS":
          const hoy = new Date();
          const año = hoy.getFullYear();
          const mes = String(hoy.getMonth() + 1).padStart(2, '0');
          const día = String(hoy.getDate()).padStart(2, '0');
          const fechaActual = `${año}-${mes}-${día}`;

          var posX = parseFloat(atributos[2].value) * 3.4; 
          var posY = parseFloat(atributos[3].value) * 16.5;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`${fechaActual}`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.13),
            color: rgb(0, 0, 0), 
          });
          break
        case "ATENCION":
          var posX = parseFloat(atributos[2].value) * 10.6; 
          var posY = parseFloat(atributos[3].value) * 14.7;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`ATENCION`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.6),
            color: rgb(0, 0, 0), 
          });
          break
        case "VENDEDOR":
          var posX = parseFloat(atributos[1].value) * 2.85; 
          var posY = parseFloat(atributos[2].value) * 16.8;
          var fontSize = parseFloat(atributos[3]?.value) || 12;
          page.drawText(`VENDEDOR`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.13),
            color: rgb(0, 0, 0), 
          });
          break
        case "NOMVENDE":
          var posX = parseFloat(atributos[2].value) * 2.8; 
          var posY = parseFloat(atributos[3].value) * 16.8;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`Pagina Web`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.13),
            color: rgb(0, 0, 0), 
          });
          break
        case "CLIENTE":
          var posX = parseFloat(atributos[2].value) * 1.26; 
          var posY = parseFloat(atributos[3].value) * 13.92;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`CLIENTE`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.5),
            color: rgb(0, 0, 0), 
          });
          break
        case "NOMCLI":
          var posX = parseFloat(atributos[2].value) * 2.9; 
          var posY = parseFloat(atributos[3].value) * 9.95;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`${userData.nombre}`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.6),
            color: rgb(0, 0, 0), 
          });
          break
        case "PCCODGRUPO3":
          break
        case "DIRECCION":
          var posX = parseFloat(atributos[2].value) * 1.17; 
          var posY = parseFloat(atributos[3].value) * 13.65;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`DIRECCION`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.5),
            color: rgb(0, 0, 0), 
          });
          break
        case "DIRCLI":
          var posX = parseFloat(atributos[2].value) * 2.66; 
          var posY = parseFloat(atributos[3].value) * 9.75;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`${userData.direccion == '' ? '' : userData.direccion}`, {
            x: posX,
            y: posY,
            size: (fontSize * 1.6),
            color: rgb(0, 0, 0), 
          });
          break
        case "TELEFONO":
          var posX = parseFloat(atributos[2].value) * 8.13; 
          var posY = parseFloat(atributos[3].value) * 13.95;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`TELEFONO`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.55),
            color: rgb(0, 0, 0), 
          });
          break
        case "TELCLI":
          var posX = parseFloat(atributos[2].value) * 9.05;
          var posY = parseFloat(atributos[3].value) * 34.86;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`${userData.telefono}`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.6),
            color: rgb(0, 0, 0), 
          });
          break
        case "De mi consideración:":
          var posX = parseFloat(atributos[2].value);
          var posY = parseFloat(atributos[3].value) * 13;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`De mi consideración:`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.58),
            color: rgb(0, 0, 0), 
          });
          break
        case "A continuación me es grato presentar la oferta de productos y/o servicios, solicitados por usted: ":
          var posX = parseFloat(atributos[2].value) * 0.92;
          var posY = parseFloat(atributos[3].value) * 2.55;
          var fontSize = parseFloat(atributos[4]?.value) || 12;
          page.drawText(`A continuación me es grato presentar la oferta de productos y/o servicios, solicitados por usted:`, {
            x: posX,
            y: posY,
            size: (fontSize * 0.58),
            color: rgb(0, 0, 0), 
          });
          break
        // case "SUBTOTAL T0":
        //   var posX = parseFloat(atributos[2].value);
        //   var posY = parseFloat(atributos[3].value);
        //   var fontSize = parseFloat(atributos[4]?.value) || 12;
        //   page.drawText(`SUBTOTAL T0`, {
        //     x: (posX * 3),
        //     y: (posY * 6),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   page.drawText(`Valor SubTotal0`, {
        //     x: (posX * 4),
        //     y: (posY * 6),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   break
        // case "SUBTOTAL T14":
        //   var posX = parseFloat(atributos[2].value);
        //   var posY = parseFloat(atributos[3].value);
        //   var fontSize = parseFloat(atributos[4]?.value) || 12;
        //   page.drawText(`SUBTOTAL T14`, {
        //     x: (posX * 2.92),
        //     y: (posY * 5.6),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   page.drawText(`Valor subtotal14`, {
        //     x: (posX * 3.89),
        //     y: (posY * 5.6),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   break
        // case "DESCUENTO":
        //   var posX = parseFloat(atributos[2].value);
        //   var posY = parseFloat(atributos[3].value);
        //   var fontSize = parseFloat(atributos[4]?.value) || 12;
        //   page.drawText(`DESCUENTO`, {
        //     x: (posX * 2.85),
        //     y: (posY * 5.2),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   page.drawText(`Valor del descuento`, {
        //     x: (posX * 3.785),
        //     y: (posY * 5.2),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   break
        // case "SUMAN":
        //   var posX = parseFloat(atributos[2].value);
        //   var posY = parseFloat(atributos[3].value);
        //   var fontSize = parseFloat(atributos[4]?.value) || 12;
        //   page.drawText(`SUMAN`, {
        //     x: (posX  * 2.77),
        //     y: (posY  * 4.8),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   page.drawText(`Valor Suman`, {
        //     x: (posX  * 3.69),
        //     y: (posY  * 4.8),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   break
        // case "IVA 15%":
        //   var posX = parseFloat(atributos[2].value);
        //   var posY = parseFloat(atributos[3].value);
        //   var fontSize = parseFloat(atributos[4]?.value) || 12;
        //   page.drawText(`IVA 15%`, {
        //     x: (posX * 2.7),
        //     y: (posY * 4.4),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   page.drawText(`Valor iva 15`, {
        //     x: (posX * 3.6),
        //     y: (posY * 4.4),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   break
        // case "TOTAL":
        //   var posX = parseFloat(atributos[2].value);
        //   var posY = parseFloat(atributos[3].value);
        //   var fontSize = parseFloat(atributos[4]?.value) || 12;
        //   page.drawText(`TOTAL`, {
        //     x: (posX * 2.63),
        //     y: (posY * 4),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   page.drawText(`Valor Total`, {
        //     x: (posX * 3.515),
        //     y: (posY * 4),
        //     size: (fontSize * 0.58),
        //     color: rgb(0, 0, 0), 
        //   });
        //   break
      }  
    })
    // Crecion par las tablas 
    var seccionProducts = secciones[0]
    var seccionProductsAtributos = seccionProducts.atributos;
    var seccionProductsColumns = seccionProducts.columnas;

    const posX = parseFloat(seccionProductsAtributos.find(attr => attr.key.toLowerCase() === "posx")?.value || 0);
    const posY = parseFloat(seccionProductsAtributos.find(attr => attr.key.toLowerCase() === "posy")?.value || 0);
    const ancho = parseFloat(seccionProductsAtributos.find(attr => attr.key.toLowerCase() === "ancho")?.value || 0);
    const alto = parseFloat(seccionProductsAtributos.find(attr => attr.key.toLowerCase() === "alto")?.value || 0);
    const titulo = seccionProductsAtributos.find(attr => attr.key.toLowerCase() === "titulo")?.value || "";
    const tamañoLetra = parseInt(seccionProductsAtributos.find(attr => attr.key.toLowerCase() === "tamañoletra")?.value || 10, 10);
    const cuadro = seccionProductsAtributos.find(attr => attr.key.toLowerCase() === "cuadro")?.value === "SI";
    if (cuadro) {
        page.drawRectangle({
            x: (posX * 4),
            y: (posY * 8.3),
            width: (ancho * 2.7),
            height: (alto * 0.3),
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
            color: rgb(99 / 255, 255 / 255, 247 / 255),
        });
    }
    if (titulo) {
        page.drawText(titulo, {
            x: (posX * 4) + 240,
            y: (posY * 8) + (alto * 0.87) - 10,
            size: tamañoLetra,
            color: rgb(0, 0, 0),
        });
    }
    // Dibujar la cabecera de la tabla dentro del archivo PDF
    var posXColumn = posX * 4.4;
    const indicesToRemote = [3, 4, 5, 6];

    seccionProductsColumns = seccionProductsColumns.filter((_, index) => {
      return !indicesToRemote.includes(index);
    });
    seccionProductsColumns.forEach((columnGroup) => {
      var tituloObj = columnGroup.find((item) => item.key === "Titulo");
      var anchoObj = columnGroup.find((item) => item.key === "Ancho");

      if (tituloObj && anchoObj) {
        var titulo = tituloObj.value;
        var anchoColumna = parseFloat(anchoObj.value) * 3.9;

        page.drawRectangle({
          x: posXColumn - 5,
          y: posY * 8.05 - 5,
          width: anchoColumna,
          height: 10,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        page.drawText(titulo, {
          x: posXColumn,
          y: posY * 8,
          size: tamañoLetra,
          color: rgb(0, 0, 0),
        });

        posXColumn += anchoColumna;
      }
    });

    let posYFila = posY * 8 - 10;
    productsSelected.forEach((producto, indexProduct) => {
      var posXColumn = posX * 4.4;
      seccionProductsColumns.forEach((columnGroup) => {
        var tituloObj = columnGroup.find((item) => item.key === "Titulo");
        var anchoObj = columnGroup.find((item) => item.key === "Ancho");
        if (tituloObj && anchoObj) {
          var anchoColumna = parseFloat(anchoObj.value) * 3.9;
          // page.drawRectangle({
          //   x: posXColumn - 5,
          //   y: posYFila - 10,
          //   width: anchoColumna,
          //   height: 15,
          //   borderColor: rgb(0, 0, 0),
          //   borderWidth: 1,
          // });

          let texto = "";
          switch (tituloObj.value) {
            case "Codigo":
              texto = producto.cod_item || "";
              break;
            case "Descripcion":
              texto = producto.descripcion || "";
              break;
            case "Cant":
              texto = producto.cantidad?.toString() || "";
              break;
          }
          page.drawText(texto, {
            x: posXColumn,
            y: posYFila - 2, // Ajustar para centrar el texto verticalmente
            size: tamañoLetra,
            color: rgb(0, 0, 0),
          });
          posXColumn += anchoColumna;
        }
      });
      posYFila -= 15;
    });
    

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "documento_generado.pdf"; // El nombre del archivo PDF
    link.click();

    // Limpiar el objeto URL
    URL.revokeObjectURL(blobUrl);
  });
}
