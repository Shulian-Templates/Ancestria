import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import type { Muestra } from '../src/index.ts';

vi.mock('../src/lib/servidor.ts', async (importOriginal) => {
  const real: typeof import('../src/lib/servidor.ts') =
    await importOriginal<typeof import('../src/lib/servidor.ts')>();
  return { ...real, iniciar: vi.fn() };
});

/** Lo que contesta GET /api/parecido/:id. */
type Parecido = {
  id: string;
  ciudadReal: string;
  mejor: string;
  puntajes: { ciudad: string; puntaje: number }[];
};

describe('Ancestría — consigna manija', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function cargar(): Promise<typeof import('../src/index.ts')> {
    return await import('../src/index.ts');
  }

  async function cargarApp(): Promise<Express> {
    const { app } = await import('../src/lib/servidor.ts');
    await import('../src/index.ts');
    return app;
  }

  describe('buscarMuestra', () => {
    it('encuentra una muestra inventada por su id', async () => {
      const { buscarMuestra, muestrasFalsas } = await cargar();
      expect(buscarMuestra(muestrasFalsas, 'Mateo')?.ciudad).toBe('Salta');
      expect(buscarMuestra(muestrasFalsas, 'Martina')?.ciudad).toBe('AMBA');
    });

    it('encuentra una muestra de verdad por su id', async () => {
      const { buscarMuestra, muestras } = await cargar();
      expect(buscarMuestra(muestras, '89')?.ciudad).toBe('AMBA');
    });

    it('un id que no está da undefined', async () => {
      const { buscarMuestra, muestrasFalsas } = await cargar();
      expect(buscarMuestra(muestrasFalsas, 'F99')).toBeUndefined();
    });
  });

  describe('puntaje', () => {
    it('suma las frecuencias de los genotipos de la muestra', async () => {
      const { puntaje, muestrasFalsas, buscarMuestra } = await cargar();
      const salteña: Muestra | undefined = buscarMuestra(muestrasFalsas, 'Mateo');
      expect(salteña).toBeDefined();
      expect(puntaje(salteña as Muestra, 'Salta')).toBeCloseTo(46.2, 1);
      expect(puntaje(salteña as Muestra, 'AMBA')).toBeCloseTo(41.6, 1);
    });

    it('saltea las posiciones sin dato: una muestra sin ningún dato da 0', async () => {
      const { puntaje, SIN_DATO, snps } = await cargar();
      let vacios: string[] = [];
      for (let i: number = 0; i < snps.length; i++) {
        vacios.push(SIN_DATO);
      }
      expect(puntaje({ ciudad: 'X', id: 'X', genotipos: vacios }, 'Salta')).toBe(0);
    });

    it('nunca suma más que la cantidad de posiciones leídas', async () => {
      const { puntaje, ciudades, muestrasFalsas, SIN_DATO } = await cargar();
      for (let f: number = 0; f < muestrasFalsas.length; f++) {
        let leidas: number = 0;
        for (let i: number = 0; i < muestrasFalsas[f].genotipos.length; i++) {
          if (muestrasFalsas[f].genotipos[i] !== SIN_DATO) {
            leidas++;
          }
        }
        for (let c: number = 0; c < ciudades().length; c++) {
          expect(puntaje(muestrasFalsas[f], ciudades()[c])).toBeLessThanOrEqual(leidas);
        }
      }
    });
  });

  describe('ciudadMasParecida', () => {
    it('devuelve una de las ciudades de los datos', async () => {
      const { ciudadMasParecida, ciudades, muestrasFalsas } = await cargar();
      expect(ciudades()).toContain(ciudadMasParecida(muestrasFalsas[0]));
    });

    it('cada muestra inventada se parece más a la ciudad con la que fue armada', async () => {
      const { ciudadMasParecida, muestrasFalsas } = await cargar();
      for (let f: number = 0; f < muestrasFalsas.length; f++) {
        expect(ciudadMasParecida(muestrasFalsas[f])).toBe(muestrasFalsas[f].ciudad);
      }
    });

    it('la ciudad que devuelve es la del puntaje más alto', async () => {
      const { ciudadMasParecida, puntaje, ciudades, muestrasFalsas } = await cargar();
      for (let f: number = 0; f < muestrasFalsas.length; f++) {
        let mejor: number = puntaje(muestrasFalsas[f], ciudadMasParecida(muestrasFalsas[f]));
        for (let c: number = 0; c < ciudades().length; c++) {
          expect(puntaje(muestrasFalsas[f], ciudades()[c])).toBeLessThanOrEqual(mejor);
        }
      }
    });
  });

  describe('GET /api/parecido/:id', () => {
    it('devuelve un puntaje por ciudad y la ciudad ganadora', async () => {
      const app: Express = await cargarApp();
      const respuesta: request.Response = await request(app).get('/api/parecido/Mateo');
      expect(respuesta.status).toBe(200);
      const parecido: Parecido = respuesta.body as Parecido;
      expect(parecido.id).toBe('Mateo');
      expect(parecido.ciudadReal).toBe('Salta');
      expect(parecido.mejor).toBe('Salta');
      expect(parecido.puntajes).toHaveLength(6);
      expect(parecido.puntajes[5].ciudad).toBe('Salta');
      expect(parecido.puntajes[5].puntaje).toBeCloseTo(46.2, 1);
    });

    it('un id que no existe da 404', async () => {
      const app: Express = await cargarApp();
      const respuesta: request.Response = await request(app).get('/api/parecido/F99');
      expect(respuesta.status).toBe(404);
    });
  });

  describe('GET /api/falsas', () => {
    it('devuelve los ids de las 6 muestras inventadas', async () => {
      const app: Express = await cargarApp();
      const respuesta: request.Response = await request(app).get('/api/falsas');
      expect(respuesta.body).toEqual(['Martina', 'Facundo', 'Camila', 'Bruno', 'Abril', 'Mateo']);
    });
  });
});
