import { readFileSync } from 'node:fs';
import { app, iniciar } from './lib/servidor.ts';
import type { Pedido, Respuesta } from './lib/servidor.ts';

/** Una muestra de ADN: de qué ciudad es, su id, y lo que se leyó en cada posición. */
export type Muestra = { ciudad: string; id: string; genotipos: string[] };

// La carpeta donde viven los datos: snps.json, muestras.json y muestrasFalsas.json
let carpetaDatos: string = 'data/';

/** El nombre de cada una de las 99 posiciones del genoma que se midieron, en orden. */
export let snps: string[] = JSON.parse(
  readFileSync(carpetaDatos + 'snps.json', 'utf-8'),
) as string[];

/**
 * Las 441 muestras. En cada una, `genotipos[i]` es lo que se leyó en la posición `snps[i]`:
 * las dos letras que tiene esa persona ahí (`'AG'`, `'CC'`, ...) o `'.'` si no se pudo leer.
 */
export let muestras: Muestra[] = JSON.parse(
  readFileSync(carpetaDatos + 'muestras.json', 'utf-8'),
) as Muestra[];

/** Las 6 muestras inventadas de la consigna manija. */
export let muestrasFalsas: Muestra[] = JSON.parse(
  readFileSync(carpetaDatos + 'muestrasFalsas.json', 'utf-8'),
) as Muestra[];

/** Lo que dice un genotipo que no se pudo leer. */
export let SIN_DATO: string = '.';

// ============================================================================
// Funciones de ejemplo — ya están hechas. Son el modelo de lo que hay que escribir.
// ============================================================================

/**
 * La posición que ocupa un SNP en la lista `snps`, que es la misma que ocupa en los
 * `genotipos` de cada muestra. Devuelve -1 si ese nombre no está.
 *
 * @param nombre - El nombre del SNP, por ejemplo `'rs1036543'`.
 * @returns El índice de ese SNP, o -1 si no existe.
 * @example
 * indiceDeSnp('rs1036543'); // => 5
 */
export function indiceDeSnp(nombre: string): number {
  for (let i: number = 0; i < snps.length; i++) {
    if (snps[i] === nombre) {
      return i;
    }
  }
  return -1;
}

/**
 * Las ciudades que aparecen en las muestras, sin repetir y en el orden en que aparecen.
 *
 * Este es el ejemplo a seguir: un ciclo que recorre `muestras` de principio a fin, y un
 * acumulador (acá, una lista) que se va armando con lo que se encuentra en el camino. La
 * búsqueda de adentro es para no agregar dos veces la misma ciudad.
 *
 * @returns La lista de ciudades, sin repetidos.
 * @example
 * ciudades(); // => ['AMBA', 'Cuyo', 'Bahía Blanca', ...]
 */
export function ciudades(): string[] {
  let encontradas: string[] = [];
  for (let i: number = 0; i < muestras.length; i++) {
    let ciudad: string = muestras[i].ciudad;
    let yaEsta: boolean = false;
    for (let j: number = 0; j < encontradas.length; j++) {
      if (encontradas[j] === ciudad) {
        yaEsta = true;
      }
    }
    if (!yaEsta) {
      encontradas.push(ciudad);
    }
  }
  return encontradas;
}

// ============================================================================
// Consigna base — completar estas cinco funciones
// ============================================================================

/**
 * Cuántas muestras son de esa ciudad.
 *
 * @param ciudad - El nombre de la ciudad.
 * @returns La cantidad de muestras de esa ciudad.
 * @example
 * contarMuestras('Salta'); // => 37
 */
export function contarMuestras(ciudad: string): number {
  let cantidad: number = 0; // COMPLETAR: recorrer `muestras` y contar las de esa ciudad
  return cantidad;
}

/**
 * Cuántas muestras de esa ciudad tienen un genotipo leído en esa posición. Es decir:
 * cuántas no tienen `SIN_DATO` ahí.
 *
 * @param ciudad - El nombre de la ciudad.
 * @param indiceSnp - La posición a mirar, dentro de `genotipos`.
 * @returns La cantidad de muestras de esa ciudad con dato en esa posición.
 * @example
 * contarConDato('Bahía Blanca', 5); // => 93  (de 95 muestras, 2 no se pudieron leer)
 */
export function contarConDato(ciudad: string, indiceSnp: number): number {
  let cantidad: number = 0; // COMPLETAR: contar las de esa ciudad que NO tienen SIN_DATO ahí
  return cantidad;
}

/**
 * Cuántas muestras de esa ciudad tienen exactamente ese genotipo en esa posición.
 *
 * @param ciudad - El nombre de la ciudad.
 * @param indiceSnp - La posición a mirar, dentro de `genotipos`.
 * @param genotipo - El genotipo a buscar, por ejemplo `'CT'`.
 * @returns La cantidad de muestras de esa ciudad con ese genotipo en esa posición.
 * @example
 * contarGenotipo('Salta', 5, 'CT'); // => 15
 */
export function contarGenotipo(ciudad: string, indiceSnp: number, genotipo: string): number {
  let cantidad: number = 0; // COMPLETAR: contar las de esa ciudad con ese genotipo ahí
  return cantidad;
}

/**
 * Qué proporción de las muestras de esa ciudad tienen ese genotipo en esa posición.
 *
 * Ojo con el denominador: las muestras que no se pudieron leer **no cuentan**, ni arriba
 * ni abajo. Si ninguna muestra de esa ciudad tiene dato en esa posición, no hay nada que
 * dividir y la frecuencia es 0.
 *
 * Esta función no necesita ningún ciclo: se arma llamando a las dos anteriores.
 *
 * @param ciudad - El nombre de la ciudad.
 * @param indiceSnp - La posición a mirar, dentro de `genotipos`.
 * @param genotipo - El genotipo a buscar, por ejemplo `'CT'`.
 * @returns Un número entre 0 y 1.
 * @example
 * frecuencia('Salta', 5, 'CT'); // => 0.40540540540540543  (15 de 37)
 */
export function frecuencia(ciudad: string, indiceSnp: number, genotipo: string): number {
  let proporcion: number = 0; // COMPLETAR: usar contarGenotipo y contarConDato
  return proporcion;
}

/**
 * Los genotipos que aparecen en esa posición en alguna muestra, sin repetir. `SIN_DATO`
 * no es un genotipo: no va en la lista.
 *
 * Son las filas que va a tener la tabla. No se pueden escribir a mano: cambian de una
 * posición a otra.
 *
 * @param indiceSnp - La posición a mirar, dentro de `genotipos`.
 * @returns La lista de genotipos presentes, sin repetidos.
 * @example
 * genotiposPresentes(5); // => ['CC', 'CT', 'TT']  (en algún orden)
 */
export function genotiposPresentes(indiceSnp: number): string[] {
  let presentes: string[] = []; // COMPLETAR: mirar `ciudades` como ejemplo
  return presentes;
}

// ============================================================================
// Rutas — ya están hechas. Usan las funciones de arriba.
// ============================================================================

// La lista de SNPs, para llenar el desplegable de la página
app.get('/api/snps', (req: Pedido, res: Respuesta) => {
  res.json(snps);
});

// La tabla de un SNP: una fila por genotipo, una columna por ciudad
app.get('/api/tabla/:snp', (req: Pedido, res: Respuesta) => {
  let indiceSnp: number = indiceDeSnp(req.params.snp);
  if (indiceSnp === -1) {
    res.status(404).end();
    return;
  }

  // Las columnas: cada ciudad con su cantidad de muestras
  let nombres: string[] = ciudades();
  let columnas: { nombre: string; cantidad: number }[] = [];
  for (let c: number = 0; c < nombres.length; c++) {
    columnas.push({ nombre: nombres[c], cantidad: contarMuestras(nombres[c]) });
  }

  // Las filas: cada genotipo con su frecuencia en cada ciudad
  let genotipos: string[] = genotiposPresentes(indiceSnp).sort();
  let filas: { genotipo: string; frecuencias: number[] }[] = [];
  for (let g: number = 0; g < genotipos.length; g++) {
    let frecuencias: number[] = [];
    for (let c: number = 0; c < nombres.length; c++) {
      frecuencias.push(frecuencia(nombres[c], indiceSnp, genotipos[g]));
    }
    filas.push({ genotipo: genotipos[g], frecuencias });
  }

  res.json({ snp: req.params.snp, ciudades: columnas, filas });
});

// ============================================================================
// ---- Consigna manija ----
// ============================================================================

/**
 * La muestra de esa lista que tiene ese id, o `undefined` si no está ninguna.
 *
 * @param lista - La lista donde buscar (`muestras` o `muestrasFalsas`).
 * @param id - El id de la muestra buscada.
 * @returns La muestra encontrada, o `undefined`.
 * @example
 * buscarMuestra(muestrasFalsas, 'F6'); // => { ciudad: 'Salta', id: 'F6', genotipos: [...] }
 */
export function buscarMuestra(lista: Muestra[], id: string): Muestra | undefined {
  return undefined; // COMPLETAR: recorrer la lista y devolver la que tenga ese id
}

/**
 * Qué puntaje saca una muestra para una ciudad: la suma, posición por posición, de la
 * frecuencia que tiene en esa ciudad el genotipo que la muestra tiene ahí.
 *
 * Cuanto más seguido aparezcan en esa ciudad los genotipos que esta muestra tiene, más
 * alto el puntaje. Las posiciones con `SIN_DATO` se saltean: no suman nada.
 *
 * @param muestra - La muestra a evaluar.
 * @param ciudad - La ciudad contra la que se la compara.
 * @returns La suma de las frecuencias. Da entre 0 y la cantidad de posiciones leídas.
 * @example
 * puntaje(muestrasFalsas[5], 'Salta'); // => 46.2...
 */
export function puntaje(muestra: Muestra, ciudad: string): number {
  let total: number = 0; // COMPLETAR: recorrer los `genotipos` de la muestra y sumar frecuencias
  return total;
}

/**
 * La ciudad que le da el puntaje más alto a esa muestra.
 *
 * @param muestra - La muestra a evaluar.
 * @returns El nombre de la ciudad con el puntaje más alto.
 * @example
 * ciudadMasParecida(muestrasFalsas[5]); // => 'Salta'
 */
export function ciudadMasParecida(muestra: Muestra): string {
  let mejor: string = ''; // COMPLETAR: recorrer ciudades() y quedarse con la del puntaje más alto
  return mejor;
}

// Los ids de las muestras inventadas, para llenar el desplegable de la página
app.get('/api/falsas', (req: Pedido, res: Respuesta) => {
  let ids: string[] = [];
  for (let i: number = 0; i < muestrasFalsas.length; i++) {
    ids.push(muestrasFalsas[i].id);
  }
  res.json(ids);
});

// El puntaje de una muestra inventada contra cada ciudad
app.get('/api/parecido/:id', (req: Pedido, res: Respuesta) => {
  let muestra: Muestra | undefined = buscarMuestra(muestrasFalsas, req.params.id);
  if (muestra === undefined) {
    res.status(404).end();
    return;
  }
  let nombres: string[] = ciudades();
  let puntajes: { ciudad: string; puntaje: number }[] = [];
  for (let c: number = 0; c < nombres.length; c++) {
    puntajes.push({ ciudad: nombres[c], puntaje: puntaje(muestra, nombres[c]) });
  }
  res.json({
    id: muestra.id,
    ciudadReal: muestra.ciudad,
    puntajes,
    mejor: ciudadMasParecida(muestra),
  });
});

// ============================================================================

iniciar();
