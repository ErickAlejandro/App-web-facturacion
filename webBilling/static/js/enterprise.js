let userData = JSON.parse(document.getElementById('userData').textContent);
let enterpriseData = JSON.parse(document.getElementById('enterpriseData').textContent);
const nameEnterprise = document.getElementById("nameEnterprise");
const direccionEmpresa = document.getElementById("direccionEmpresa");
const telefonoEmpresa = document.getElementById("telefonoEmpresa");

userNameLoged.textContent = userData.nombre;
userRucLoged.textContent = userData.ruc;

nameEnterprise.textContent = enterpriseData[0].nombreempresa;
direccionEmpresa.textContent = enterpriseData[0].direccion1;
telefonoEmpresa.textContent = enterpriseData[0].telefono1;

console.log(enterpriseData[0])