let userData = JSON.parse(document.getElementById('userData').textContent);
let enterpriseData = JSON.parse(document.getElementById('enterpriseData').textContent);

userNameLoged.textContent = userData.nombre;
userRucLoged.textContent = userData.ruc;