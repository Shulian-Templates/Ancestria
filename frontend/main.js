const selectSnp = document.querySelector('#snp');
const tablaHead = document.querySelector('#tablaHead');
const tablaBody = document.querySelector('#tablaBody');
const avisoTabla = document.querySelector('#avisoTabla');
const selectFalsa = document.querySelector('#falsa');
const botonComparar = document.querySelector('#comparar');
const avisoFalsas = document.querySelector('#avisoFalsas');
const resultado = document.querySelector('#resultado');

const porcentaje = (x) => (x * 100).toFixed(1) + '%';

function avisar(elemento, mensaje) {
  if (mensaje === null) {
    elemento.hidden = true;
    elemento.textContent = '';
  } else {
    elemento.hidden = false;
    elemento.textContent = mensaje;
  }
}

// Las funciones todavía vacías devuelven 0: la tabla queda vacía o llena de ceros
function revisarTabla(datos) {
  if (datos.filas.length === 0) {
    return 'La tabla no tiene filas: genotiposPresentes() todavía devuelve una lista vacía.';
  }
  const hayCantidad = datos.ciudades.some((c) => c.cantidad > 0);
  if (!hayCantidad) {
    return 'Todas las ciudades tienen 0 muestras: falta completar contarMuestras().';
  }
  const hayFrecuencia = datos.filas.some((f) => f.frecuencias.some((v) => v > 0));
  if (!hayFrecuencia) {
    return 'Todas las frecuencias dan 0: falta completar contarGenotipo(), contarConDato() o frecuencia().';
  }
  return null;
}

async function mostrarTabla() {
  const snp = selectSnp.value;
  const respuesta = await fetch(`/api/tabla/${snp}`);
  if (!respuesta.ok) {
    avisar(avisoTabla, `El servidor contestó ${respuesta.status} para ${snp}.`);
    return;
  }
  const datos = await respuesta.json();
  avisar(avisoTabla, revisarTabla(datos));

  tablaHead.innerHTML = '';
  const filaTitulos = document.createElement('tr');
  filaTitulos.appendChild(document.createElement('th')).textContent = 'Genotipo';
  datos.ciudades.forEach((ciudad) => {
    const th = document.createElement('th');
    th.textContent = ciudad.nombre;
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = `n = ${ciudad.cantidad}`;
    th.appendChild(n);
    filaTitulos.appendChild(th);
  });
  tablaHead.appendChild(filaTitulos);

  tablaBody.innerHTML = '';
  datos.filas.forEach((fila) => {
    const tr = document.createElement('tr');
    tr.appendChild(document.createElement('td')).textContent = fila.genotipo;
    fila.frecuencias.forEach((valor) => {
      const td = document.createElement('td');
      const celda = document.createElement('div');
      celda.className = 'celda';
      const numero = document.createElement('span');
      numero.textContent = porcentaje(valor);
      const barra = document.createElement('div');
      barra.className = 'barra';
      const relleno = document.createElement('span');
      relleno.style.width = `${Math.round(valor * 100)}%`;
      barra.appendChild(relleno);
      celda.appendChild(numero);
      celda.appendChild(barra);
      td.appendChild(celda);
      tr.appendChild(td);
    });
    tablaBody.appendChild(tr);
  });
}

async function mostrarParecido() {
  const id = selectFalsa.value;
  const respuesta = await fetch(`/api/parecido/${id}`);
  if (!respuesta.ok) {
    // 404 acá casi siempre es buscarMuestra() todavía vacía: la ruta no encuentra la muestra
    const pista =
      respuesta.status === 404
        ? ` Si buscarMuestra() todavía devuelve undefined, la ruta no encuentra la muestra ${id}.`
        : '';
    avisar(avisoFalsas, `El servidor contestó ${respuesta.status} para la muestra ${id}.` + pista);
    resultado.innerHTML = '';
    return;
  }
  const datos = await respuesta.json();

  const maximo = Math.max(...datos.puntajes.map((p) => p.puntaje));
  if (maximo === 0) {
    avisar(avisoFalsas, 'Todos los puntajes dan 0: falta completar puntaje().');
  } else {
    avisar(avisoFalsas, null);
  }

  resultado.innerHTML = '';
  const lista = document.createElement('div');
  lista.className = 'puntajes';
  datos.puntajes.forEach((p) => {
    const fila = document.createElement('div');
    fila.className = 'puntaje' + (p.ciudad === datos.mejor ? ' gana' : '');
    const nombre = document.createElement('div');
    nombre.className = 'nombre';
    nombre.textContent = p.ciudad;
    const barra = document.createElement('div');
    barra.className = 'puntajeBarra';
    const relleno = document.createElement('span');
    // Las diferencias son chicas: la barra arranca en el 90% del puntaje más alto
    const piso = maximo * 0.9;
    const ancho = maximo === 0 ? 0 : ((p.puntaje - piso) / (maximo - piso)) * 100;
    relleno.style.width = `${Math.max(0, Math.min(100, ancho))}%`;
    barra.appendChild(relleno);
    const valor = document.createElement('div');
    valor.className = 'valor';
    valor.textContent = p.puntaje.toFixed(1);
    fila.appendChild(nombre);
    fila.appendChild(barra);
    fila.appendChild(valor);
    lista.appendChild(fila);
  });
  resultado.appendChild(lista);

  const veredicto = document.createElement('p');
  veredicto.className = 'veredicto';
  const acierto = datos.mejor === datos.ciudadReal;
  veredicto.innerHTML =
    `Puntaje más alto: <strong>${datos.mejor}</strong>. ` +
    `Esta muestra fue armada imitando a <strong>${datos.ciudadReal}</strong>. ` +
    (acierto ? '✓ Coincide.' : '✗ No coincide.');
  resultado.appendChild(veredicto);
}

async function arrancar() {
  const snps = await (await fetch('/api/snps')).json();
  snps.forEach((snp) => {
    const opcion = document.createElement('option');
    opcion.value = snp;
    opcion.textContent = snp;
    selectSnp.appendChild(opcion);
  });
  // rs1036543 es una de las posiciones donde las ciudades más se diferencian
  selectSnp.value = snps.includes('rs1036543') ? 'rs1036543' : snps[0];
  selectSnp.addEventListener('change', mostrarTabla);
  await mostrarTabla();

  const falsas = await (await fetch('/api/falsas')).json();
  falsas.forEach((id) => {
    const opcion = document.createElement('option');
    opcion.value = id;
    opcion.textContent = id;
    selectFalsa.appendChild(opcion);
  });
  botonComparar.addEventListener('click', mostrarParecido);
}

arrancar();
