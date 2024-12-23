const inputMailRuc = document.getElementById("inputMailRuc");
const inputPassword = document.getElementById("inputPassword");
const btnLogin = document.getElementById("btnLogin");

const alertSuccessImport = document.getElementById("alertSuccessImport");
const alertError = document.getElementById("alertError");
const btnCloseImport = document.getElementById("btnCloseImport");
const alertInfoUserExist = document.getElementById("alertInfoUserExist");
const btnSuccessImport = document.getElementById("btnSuccessImport");

let typingTimer;

// Función para obtener el token CSRF
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Funcionalidad del input Mail
inputMailRuc.addEventListener("input", function () {
  clearTimeout(typingTimer);
  const mailRucValue = inputMailRuc.value;
  typingTimer = setTimeout(function () {
    if (mailRucValue.trim() !== "") {
      const url = `${window.location.origin}/getInfoRucMail/${mailRucValue}/`;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Ishida7410."
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log('Datos recibidos de Django:', data);
          var coincidencia = data.coincidencias;
          var registro = data.response;
          // console.log(coincidencia, registro)

          if(coincidencia == undefined && registro == undefined){
            toastr.error(data.error, 'Error en el Tocken de Entorno')
          }else{
            if (registro.length != 0) {
              if (coincidencia != "[]") {
                alertError.style.display = "none";
                alertInfoUserExist.style.display = "";
              }else{
                alertSuccessImport.style.display = "";
                alertError.style.display = "none";
                alertInfoUserExist.style.display = "none";
                // Funcion del boton para cerrar
                btnCloseImport.addEventListener("click", function () {
                  alertSuccessImport.classList.add("hidden");
                });
              }
              // Funcion del bton para importar los datos al Formulario de ingreso de datos a la base interna de la aplicación
              btnSuccessImport.addEventListener("click", function () {
                alertSuccessImport.classList.add("hidden");
                toastr.info("Creando y enviando credenciales al correo del usuario.", "Creando y enviando credenciales ...");
                const payload = {
                  ruc: registro[0].ruc,
                  telefono1: registro[0].telefono1,
                  direccion1: registro[0].direccion1,
                  nombre: registro[0].nombre,
                  bandcliente: registro[0].bandcliente,
                  bandproveedor: registro[0].bandproveedor,
                  email: registro[0].email,
                  estado: registro[0].estado,
                  idClienteSii4: registro[0].idprovcli,
                };
                  fetch("/createNewAccess/", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "X-CSRFToken": getCookie("csrftoken"),
                    },
                    body: JSON.stringify(payload),
                  })
                  .then((response) => {
                    if (!response.ok) {
                      return response.json().then((data) => {
                        throw new Error(data.error || "Error en la solicitud");
                      });
                    }
                    return response.json();
                  })
                  .then((data) => {
                    toastr.success(
                      "Los accesos fueron generados correctamente, los accesos se encuentran en el correo registrado en el sistema Sii4.",
                      "Éxito"
                    );
                    setTimeout(function () {
                      location.reload();
                    }, 3000);
                  })
                  .catch((error) => {
                    toastr.error(error.message, "Error");
                  });
              })
            }else{
              alertError.style.display = "";
              alertInfoUserExist.style.display = "none";
            }
          }
          
        })
        .catch((error) => {
          console.error("Error al hacer la solicitud:", error);
        });
    }
  }, 1000);
});

// Funcionalidad del boton de Login
btnLogin.addEventListener("click", function () {
  const payload = {
    correo_ruc: inputMailRuc.value,
    password: inputPassword.value,
  };
  fetch("/loginAccess/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        toastr.success("Las credenciales son correctas.", "Exito");
        // Redirigir al usuario a la página principal o donde desees
        window.location.href = "/facturacion/";
      } else {
        console.log(data.error);
        toastr.error("Las credenciales son incorrectas.", "Error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Hubo un problema con el login");
    });
});
