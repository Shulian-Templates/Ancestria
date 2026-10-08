# Ancestría

Contar, acumular y dividir sobre 441 muestras de ADN para armar una tabla de frecuencias por ciudad.

Los datos crudos, tal como vinieron, también están en `data/` (el `.csv` separado por `;`).
El ejercicio no los usa: trabaja con los JSON que salieron de convertirlos.

## Consigna base

Hay 441 muestras de ADN de seis lugares de la Argentina. De cada persona se leyeron 99
posiciones del genoma, siempre las mismas. El frontend ya está hecho: muestra una tabla con
una fila por genotipo y una columna por ciudad, y un desplegable para elegir la posición.
Las rutas también están hechas. Lo que falta son las **cinco funciones** que calculan los
números de la tabla, en `src/index.ts`.

### Los datos

Los tres JSON viven en `data/` y ya están leídos arriba de todo en `src/index.ts`: no
hay que abrir ningún archivo.

`data/snps.json` es la lista de las 99 posiciones que se midieron, con el nombre que les da
el catálogo internacional:

```json
["rs1004704", "rs10131076", "rs1013459", "..."]
```

`data/muestras.json` son las 441 muestras:

```json
{
  "ciudad": "Salta",
  "id": "412",
  "genotipos": ["AG", "GG", ".", "AA", "..."]
}
```

**La clave de todo el ejercicio está en `genotipos`:** es una lista que va en el mismo orden
que `snps`. O sea que `genotipos[5]` es lo que se leyó en la posición `snps[5]`, que es
`rs1036543`. Las dos listas están alineadas, y por eso siempre se trabaja con el **índice**
de la posición, no con su nombre.

Cada genotipo son las dos letras que esa persona tiene en esa posición (`'AG'`, `'CC'`,
`'TT'`, ...), porque de cada posición del genoma tenemos dos copias, una de cada padre.
En genética, "genotipo" también se usa para todo el ADN de una persona; acá es lo que
tiene en una sola posición.
Cuando la máquina no pudo leer una posición, en lugar de las dos letras hay un punto:

```typescript
let SIN_DATO: string = '.';
```

Eso pasa seguido y es el detalle que hace o rompe el ejercicio.

### Lo que ya está hecho: `ciudades` y `indiceDeSnp`

`ciudades()` devuelve las ciudades que aparecen en las muestras, sin repetir.
**Está escrita como ejemplo**: es exactamente la forma que tienen las funciones que hay que
escribir — un ciclo que recorre `muestras` de principio a fin y un acumulador que se va
armando con lo que se encuentra en el camino. Leerla antes de empezar.

`indiceDeSnp('rs1036543')` devuelve `5`: traduce el nombre de una posición al índice que
ocupa en `genotipos`. La usa la ruta, no hace falta tocarla.

### Las cinco funciones

| Función                                       | Qué devuelve                                                         |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `contarMuestras(ciudad)`                      | Cuántas muestras son de esa ciudad.                                  |
| `contarConDato(ciudad, indiceSnp)`            | Cuántas de esa ciudad tienen algo leído en esa posición.             |
| `contarGenotipo(ciudad, indiceSnp, genotipo)` | Cuántas de esa ciudad tienen ese genotipo en esa posición.           |
| `frecuencia(ciudad, indiceSnp, genotipo)`     | Qué proporción de esa ciudad tiene ese genotipo. Un número de 0 a 1. |
| `genotiposPresentes(indiceSnp)`               | Los genotipos que aparecen en esa posición, sin repetir.             |

Conviene hacerlas en ese orden: cada una se parece a la anterior.

`contarMuestras` es la más chica de todas y es el ejemplo: un contador en 0, un ciclo que
recorre las 441 muestras, un `if`, y sumar 1 cuando corresponde. `contarMuestras('Salta')`
tiene que dar 37, y se puede verificar a mano.

`contarConDato` es la misma función con un `if` de dos condiciones: que la muestra sea de
esa ciudad **y** que lo que tenga en esa posición no sea `SIN_DATO`.

`contarGenotipo` es otra vez la misma, cambiando con qué se compara. Si parece repetitivo,
es porque lo es: son tres contadores con la misma forma.

**`frecuencia` es la que tiene la trampa.** Es una división, y no lleva ningún ciclo: se
arma llamando a las dos funciones anteriores. La trampa está en el denominador. Si una
muestra no se pudo leer en esa posición, no cuenta **ni arriba ni abajo**: no se sabe qué
tiene esa persona ahí, así que esa muestra no participa de la cuenta. El denominador es
`contarConDato`, **no** `contarMuestras`.

La diferencia es real: en Bahía Blanca hay 95 muestras, pero en la posición 5 hay 93 con
dato. Si se divide por 95, todos los números salen un poco bajos — y salen _más_ bajos en
las ciudades que tienen más datos faltantes, que no son todas iguales. Es un error que da
números creíbles, y por eso es difícil de ver.

También hay que cuidar el caso en el que no hay **ninguna** muestra con dato: ahí no hay
nada que dividir y la frecuencia es 0. Si no, la división da `NaN` y la tabla se llena de
"NaN%".

`genotiposPresentes` son las filas de la tabla. No se pueden escribir a mano porque cambian
de una posición a otra: en algunas hay tres genotipos y en otras dos. Es la misma forma que
`ciudades()`, pero recorriendo una posición de todas las muestras en lugar de las ciudades,
y sin contar `SIN_DATO`.

### Lo que no hay que escribir

La ruta `GET /api/tabla/:snp` ya está hecha, y es la que arma la tabla llamando a estas
cinco funciones: recorre las ciudades, recorre los genotipos, y pide una frecuencia para
cada cruce. Vale la pena leerla para ver cómo cinco funciones de un solo ciclo alcanzan
para armar una tabla de dos dimensiones.

### Qué se ve cuando funciona

```bash
npm run start
```

La página abre en `rs1036543`. Si todo está bien, las seis columnas muestran números
distintos: el genotipo `TT` está en el 61% de las muestras de AMBA y en el 13% de las de
Salta, y el `CC` al revés: 8% en AMBA y 46% en Salta. Ahora cambiar el desplegable a `rs1013459` y mirar de nuevo: las seis columnas dan
casi lo mismo.

Esa diferencia entre las dos posiciones es el ejercicio. De las 99 posiciones, unas pocas
distinguen bastante entre ciudades y la mayoría no distingue casi nada. Buscar en el
desplegable alguna otra que se parezca a `rs1036543`.

Mientras las funciones estén vacías, la página lo avisa arriba de la tabla: dice cuál falta.

## Consigna manija

Si cada ciudad tiene sus frecuencias, ¿se puede ir para el otro lado? Dada una muestra,
¿se puede adivinar de qué ciudad es?

En `data/muestrasFalsas.json` hay seis muestras **inventadas**: `Martina`, `Facundo`, `Camila`, `Bruno`, `Abril` y `Mateo`. Cada una fue
armada imitando a una ciudad: en cada posición se le puso un genotipo elegido al azar
respetando las frecuencias de esa ciudad. Son seis personas que no existen.

La idea es darle a cada ciudad un **puntaje** para una muestra: recorrer las 99 posiciones y
sumar, en cada una, la frecuencia que tiene en esa ciudad el genotipo que la muestra tiene
ahí. Si la muestra tiene genotipos que en esa ciudad son comunes, suma mucho; si tiene
genotipos que ahí son raros, suma poco. Después gana la ciudad con el puntaje más alto.

Van en el mismo `src/index.ts`, abajo de todo, donde dice `---- Consigna manija ----`:

| Función                      | Qué devuelve                                                     |
| ---------------------------- | ---------------------------------------------------------------- |
| `buscarMuestra(lista, id)`   | La muestra de esa lista con ese id, o `undefined`.               |
| `puntaje(muestra, ciudad)`   | La suma de las frecuencias de esa ciudad, posición por posición. |
| `ciudadMasParecida(muestra)` | La ciudad que le da el puntaje más alto.                         |

`buscarMuestra` es una búsqueda lineal, igual que la de Neurosys pero por `id`. Recibe la
lista por parámetro porque sirve para las dos: `muestras` y `muestrasFalsas`.

`puntaje` es un acumulador igual a los contadores de la base, con una diferencia: en lugar
de sumar 1 suma una fracción, la que devuelve `frecuencia`. Las posiciones con `SIN_DATO` se
saltean: no suman nada. El resultado da unos 45 y pico, porque son unas 95 posiciones leídas
sumando cada una entre 0 y 1.

`ciudadMasParecida` recorre `ciudades()` y se queda con la del puntaje más alto. Es la misma
forma que un contador, pero en lugar de sumar guarda el mejor que vio hasta ahora, y hay que
acordarse de dos cosas a la vez: cuál es la mejor ciudad y qué puntaje saca.

La página tiene abajo un panel para probar las seis: elegir una, tocar "Comparar", y ver si
el puntaje más alto cae en la ciudad con la que fue armada. Las seis tienen que acertar, y
los tests lo verifican.

### Una aclaración importante

Que las seis acierten no significa que esto funcione con muestras de verdad. Están armadas
a partir de las frecuencias de su ciudad, así que son casos fáciles por construcción: se
hicieron para que el mecanismo se pueda ver andar.

Con las 441 muestras reales el método acierta apenas más que contestar siempre "AMBA" sin
mirar nada, que acierta el 38% de las veces nada más que porque AMBA es la ciudad con más
muestras. Las ciudades se diferencian de verdad en sus frecuencias **promedio**, y eso es lo
que muestra la tabla de la consigna base; pero las personas de una misma ciudad son tan
distintas entre sí que con 99 posiciones no alcanza para ubicar a una persona concreta.
Mirando los puntajes de la página se ve por qué: las seis ciudades quedan siempre muy cerca
unas de otras.

## ¿Qué hay que editar?

- `src/index.ts` — las cinco funciones de la consigna base y, para la manija, las tres de
  abajo.

Todo lo demás ya está completo: `ciudades` e `indiceDeSnp` (los ejemplos), las rutas,
`src/lib/servidor.ts`, `data/` y todo el `frontend/`.

## Primeros pasos

```bash
npm install
```

## Cómo correr el programa

```bash
npm run start
```

Se abre solo el browser en `http://localhost:3000`.

## Tests

```bash
npm run test-base    # consigna base
npm run test-manija  # consigna manija
npm test             # todos
```
