/*var data = []
     
fetch('https://www.pais.gob.pe/backendsismonitor/public/seguimientoequipo/listarMapaEquiposRegion')
.then(response => response.json())
.then(dataFromEndpoint => {
    data = dataFromEndpoint; // Asigna los datos del endpoint a la variable data.
    console.log(dataFromEndpoint)
 
  iniciarMapa(data); // Asegúrate de llamar a iniciarMapa aquí

})
.catch(error => {
    console.error('Error al obtener los datos:', error);
}); */

function cargarData(valor){
    let postData = {
        tipo: 2
    };
    
    // Convertir los datos a una cadena JSON para enviar como el cuerpo de la solicitud POST
    let postBody = JSON.stringify(postData);
    
    fetch('https://www.pais.gob.pe/backendsismonitor/public/seguimientoequipo/listarEquiposInformaticosIndicadorMapa', {
        method: 'POST', // Especifica que la solicitud es un POST
        headers: {
            'Content-Type': 'application/json', // Indica que el cuerpo de la solicitud es JSON
            // 'Authorization': 'Bearer ' + token, // Si necesitas una autorización (por ejemplo, JWT), descomenta esta línea y reemplaza 'token' con tu token de autenticación
        },
        body: postBody // El cuerpo de la solicitud es la cadena JSON que has creado a partir de tus datos
    })
    .then(response => response.json())
    .then(dataFromEndpoint => {
        data = dataFromEndpoint; // Asigna los datos del endpoint a la variable data
        console.log(dataFromEndpoint); // Muestra los datos de la respuesta en la consola
        if(valor == ''){
            iniciarMapa(data); // Llama a la función iniciarMapa con los datos obtenidos
        } 
      })
    .catch(error => {
        console.error('Error al obtener los datos:', error);
    });
}

cargarData('');
async function cargarTambos(id) {
  console.log(id)
   try {
        const response = await fetch(`https://www.pais.gob.pe/backendsismonitor/public/seguimientoequipo/listarMapaEquiposRegionTambos/${id}`);
        const tambos = await response.json();
      ///  console.log(tambos); // Muestra los datos en la consola para verificar
        return tambos; // Ahora puedes retornar tambos
    } catch (error) {
        console.error('Error al obtener los datos de tambos:', error);
        return []; // Retornas un array vacío en caso de error
    } 
}

async function cargarTambosDatosv(valor) {
    console.log("aqwyy");
    let postData = {
        tipo: 4,
        departamento: valor
    };
    
    // Convertir los datos a una cadena JSON para enviar como el cuerpo de la solicitud POST
    let postBody = JSON.stringify(postData);
    
    try {
        // Utiliza 'await' para esperar la respuesta de la promesa de 'fetch'
        let response = await fetch('https://www.pais.gob.pe/backendsismonitor/public/seguimientoequipo/listarEquiposInformaticosIndicadorMapa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ' + token,
            },
            body: postBody
        });
        
        // Espera a que la respuesta se convierta en JSON
        let dataFromEndpoint = await response.json();
        console.log(dataFromEndpoint);
        
        // Ejecuta código adicional con 'dataFromEndpoint' si es necesario
        if (valor === '') {
            // iniciarMapa(dataFromEndpoint);
        }
        
        // Retorna los datos recibidos del endpoint
        return dataFromEndpoint;
        
    } catch (error) {
        // Maneja los errores que ocurran durante la llamada fetch o la conversión de la respuesta
        console.error('Error al obtener los datos:', error);
        return [];
    }
}

function iniciarMapa(data) {

    anychart.onDocumentReady(function () {
 
         var equipos_vigentes = 0;
         
         data.forEach(function (dta) {
            equipos_vigentes += +dta.equipos_vigentes;

         });
         console.log(equipos_vigentes)

         var equipos_obsoletos = 0;
         
         data.forEach(function (dta) {
            equipos_obsoletos += +dta.equipos_obsoletos;

         });
         console.log(equipos_obsoletos)

         console.log(equipos_vigentes)

        
          
         document.getElementById('pais1cantidad').textContent = equipos_vigentes;
         document.getElementById('pais3cantidad').textContent = equipos_vigentes + equipos_obsoletos;

         document.getElementById('miDivOcultableBoton').style.display = 'none';
        document.getElementById('miDivOcultableTambo').style.display = 'none';
    
        // create map
        var map = anychart.map();
      
        map.background().fill("none");
      
        map.legend(false);
        map.overlapMode(false);

          var tbody = document.getElementById('tabla-departamentos');
    
          data.forEach(function (departamento) {
            var fila = document.createElement('tr');
            var celdaDepartamento = document.createElement('td');
            celdaDepartamento.textContent = departamento.departamento_agrupado;

            var equiposvigentes = document.createElement('td');
            equiposvigentes.textContent = departamento.equipos_vigentes ;  

            var equiposobsoletos = document.createElement('td');
            equiposobsoletos.textContent = departamento.equipos_obsoletos ;  

            fila.appendChild(celdaDepartamento);
            fila.appendChild(equiposvigentes); 
            fila.appendChild(equiposobsoletos);      
            tbody.appendChild(fila);           
          });
     
        var dataSet = anychart.data.set(data);
         
        series = map.choropleth(dataSet);
    
        // set geoIdField to 'id', this field contains in geo data meta properties
        series.geoIdField('id');
    
        // set map color settings
        //series.colorScale(anychart.scales.linearColor('#deebf7', '#3182bd'));
        series.hovered().fill('#addd8e');
        var scale = anychart.scales.ordinalColor([
            { from: 0, to: 64, color: '#FE0000' },
            { from: 65, to: 89, color: '#FFFF02' },
            { from: 90, to: 100, color: '#4DE600' }
        ]);
        //series.colorScale(scale).labels(true);
    
        series.colorScale(scale);
    
        series.labels(true);
    
        series.labels().useHtml(true).format(function () {
            return ' (' + this.value + '%)';
        }).fontColor('black').fontSize("10px").offsetX(-7).hAlign('center');
    
        map.geoData(anychart.maps['peru']);
        map.tooltip().useHtml(true).positionMode("point");
        map.container('container').draw();
    
        map.listen('pointsSelect', function (e) {
            var selected = e.seriesStatus[0].points.map(function (point) { return point; });
            if (selected.length > 0) {
                updateSelectedData(selected[0], data);
            }
        });
    
        function updateSelectedData(selectedPoint, data) {
            var selectedData = data.find(item => item.id === selectedPoint.id);
                ['pais1', 'pais3'].forEach((id, index) => {
                    document.getElementById(id).textContent = selectedPoint.properties.name;
                    if (index < 1) { // Para 'pais1' y 'pais2', se toman 'equipos_vigentes' y 'equipos_obsoletos' respectivamente
                        // Asegúrate de que los valores son convertidos a enteros antes de mostrarlos
                        document.getElementById(id + 'cantidad').textContent = parseInt(selectedData[['equipos_vigentes'][index]], 10);
                    } else { // Para 'pais3', se convierten a enteros y se suman 'equipos_vigentes' y 'equipos_obsoletos'
                        document.getElementById(id + 'cantidad').textContent = parseInt(selectedData['equipos_vigentes'], 10) + parseInt(selectedData['equipos_obsoletos'], 10);
                    }
                });

                cargarTambosDatosv(selectedData.departamento_agrupado).then(tamsbos => {
                    console.log('Tambos cargados:', tamsbos);
    
                  //  cargarData(selectedPoint.id)
                    var tbodyTambos = document.getElementById('tabla-tambos');
                    tbodyTambos.innerHTML = ''; 
                    console.log('Tambos cargados:', tamsbos);
                    console.log(tamsbos.length)
                   if(tamsbos.length>0){               
                    tamsbos.forEach(function (tambo) {
                        var fila = document.createElement('tr');
                        ['departamento', 'tambo', 'equipos_vigentes'].forEach(function (prop) {
                            var celda = document.createElement('td');
                            celda.textContent = tambo[prop];
                            fila.appendChild(celda);
                        });
                        tbodyTambos.appendChild(fila);
                    });
                   }
                   document.getElementById('miDivOcultableBoton').style.display = 'block';

                });
           
          /*  cargarTambos(selectedPoint.id).then(tamsbos => {
                cargarData(selectedPoint.id)
                var tbodyTambos = document.getElementById('tabla-tambos');
                tbodyTambos.innerHTML = ''; 
                console.log('Tambos cargados:', tamsbos);
                console.log(tamsbos.length)
               if(tamsbos.length>0){               
                tamsbos.forEach(function (tambo) {
                    var fila = document.createElement('tr');
                    ['departamento', 'tambo', 'estado'].forEach(function (prop) {
                        var celda = document.createElement('td');
                        celda.textContent = tambo[prop];
                        fila.appendChild(celda);
                    });
                    tbodyTambos.appendChild(fila);
                });
               }
            }); */

            document.getElementById('miDivOcultableDepartamento').style.display = 'none';
            document.getElementById('miDivOcultableTambo').style.display = 'block';
        }
     
    });
}

