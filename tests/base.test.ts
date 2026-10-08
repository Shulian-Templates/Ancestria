import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

vi.mock('../src/lib/servidor.ts', async (importOriginal) => {
  const real: typeof import('../src/lib/servidor.ts') =
    await importOriginal<typeof import('../src/lib/servidor.ts')>();
  return { ...real, iniciar: vi.fn() };
});

/** Lo que contesta GET /api/tabla/:snp. */
type Tabla = {
  snp: string;
  ciudades: { nombre: string; cantidad: number }[];
  filas: { genotipo: string; frecuencias: number[] }[];
};

// rs1036543 está en la posición 5 y tiene los genotipos CC, CT y TT
let SNP: string = 'rs1036543';
let INDICE: number = 5;

describe('Ancestría — consigna base', () => {
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

  describe('contarMuestras', () => {
    it('cuenta las muestras de cada ciudad', async () => {
      const { contarMuestras } = await cargar();
      expect(contarMuestras('AMBA')).toBe(168);
      expect(contarMuestras('Cuyo')).toBe(33);
      expect(contarMuestras('Bahía Blanca')).toBe(95);
      expect(contarMuestras('Comodoro Rivadavia')).toBe(60);
      expect(contarMuestras('Esquel')).toBe(48);
      expect(contarMuestras('Salta')).toBe(37);
    });

    it('las muestras de todas las ciudades suman el total', async () => {
      const { contarMuestras, ciudades, muestras } = await cargar();
      let total: number = 0;
      for (let i: number = 0; i < ciudades().length; i++) {
        total += contarMuestras(ciudades()[i]);
      }
      expect(total).toBe(muestras.length);
    });

    it('una ciudad que no está en los datos da 0', async () => {
      const { contarMuestras } = await cargar();
      expect(contarMuestras('Rosario')).toBe(0);
    });
  });

  describe('contarConDato', () => {
    it('no cuenta las muestras sin dato en esa posición', async () => {
      const { contarConDato } = await cargar();
      expect(contarConDato('Bahía Blanca', INDICE)).toBe(93);
      expect(contarConDato('Salta', INDICE)).toBe(37);
    });

    it('en Bahía Blanca hay 95 muestras pero sólo 93 con dato en esa posición', async () => {
      const { contarConDato, contarMuestras } = await cargar();
      expect(contarMuestras('Bahía Blanca')).toBe(95);
      expect(contarConDato('Bahía Blanca', INDICE)).toBe(93);
    });

    it('nunca cuenta más muestras que las que tiene la ciudad', async () => {
      const { contarConDato, contarMuestras, ciudades, snps } = await cargar();
      for (let c: number = 0; c < ciudades().length; c++) {
        for (let i: number = 0; i < snps.length; i++) {
          expect(contarConDato(ciudades()[c], i)).toBeLessThanOrEqual(
            contarMuestras(ciudades()[c]),
          );
        }
      }
    });
  });

  describe('contarGenotipo', () => {
    it('cuenta las muestras con ese genotipo en esa posición', async () => {
      const { contarGenotipo } = await cargar();
      expect(contarGenotipo('Salta', INDICE, 'CT')).toBe(15);
      expect(contarGenotipo('Cuyo', INDICE, 'CT')).toBe(15);
      expect(contarGenotipo('AMBA', INDICE, 'CT')).toBe(53);
    });

    it('un genotipo que no aparece da 0', async () => {
      const { contarGenotipo } = await cargar();
      expect(contarGenotipo('Salta', INDICE, 'AA')).toBe(0);
    });

    it('los genotipos presentes suman las muestras con dato', async () => {
      const { contarGenotipo, contarConDato, genotiposPresentes } = await cargar();
      let presentes: string[] = genotiposPresentes(INDICE);
      let total: number = 0;
      for (let g: number = 0; g < presentes.length; g++) {
        total += contarGenotipo('AMBA', INDICE, presentes[g]);
      }
      expect(total).toBe(contarConDato('AMBA', INDICE));
    });
  });

  describe('frecuencia', () => {
    it('divide por las muestras con dato, no por el total de la ciudad', async () => {
      const { frecuencia } = await cargar();
      // Salta: 15 de 37
      expect(frecuencia('Salta', INDICE, 'CT')).toBeCloseTo(15 / 37, 10);
      // Bahía Blanca: 35 de 93 con dato (no de las 95 muestras)
      expect(frecuencia('Bahía Blanca', INDICE, 'CT')).toBeCloseTo(35 / 93, 10);
      expect(frecuencia('Bahía Blanca', INDICE, 'CT')).not.toBeCloseTo(35 / 95, 6);
    });

    it('las frecuencias de los genotipos presentes suman 1 en cada ciudad', async () => {
      const { frecuencia, genotiposPresentes, ciudades } = await cargar();
      let presentes: string[] = genotiposPresentes(INDICE);
      for (let c: number = 0; c < ciudades().length; c++) {
        let total: number = 0;
        for (let g: number = 0; g < presentes.length; g++) {
          total += frecuencia(ciudades()[c], INDICE, presentes[g]);
        }
        expect(total).toBeCloseTo(1, 10);
      }
    });

    it('si no hay ninguna muestra con dato devuelve 0, no NaN', async () => {
      const { frecuencia } = await cargar();
      expect(frecuencia('Rosario', INDICE, 'CT')).toBe(0);
    });

    it('siempre da un número entre 0 y 1', async () => {
      const { frecuencia, ciudades, genotiposPresentes } = await cargar();
      let presentes: string[] = genotiposPresentes(INDICE);
      for (let c: number = 0; c < ciudades().length; c++) {
        for (let g: number = 0; g < presentes.length; g++) {
          let valor: number = frecuencia(ciudades()[c], INDICE, presentes[g]);
          expect(valor).toBeGreaterThanOrEqual(0);
          expect(valor).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('genotiposPresentes', () => {
    it('devuelve los genotipos de esa posición, sin repetir', async () => {
      const { genotiposPresentes } = await cargar();
      expect([...genotiposPresentes(INDICE)].sort()).toEqual(['CC', 'CT', 'TT']);
    });

    it('no incluye el SIN_DATO', async () => {
      const { genotiposPresentes, SIN_DATO } = await cargar();
      for (let i: number = 0; i < 20; i++) {
        expect(genotiposPresentes(i)).not.toContain(SIN_DATO);
      }
    });

    it('no repite ninguno en ninguna posición', async () => {
      const { genotiposPresentes, snps } = await cargar();
      for (let i: number = 0; i < snps.length; i++) {
        let presentes: string[] = genotiposPresentes(i);
        expect(new Set(presentes).size).toBe(presentes.length);
      }
    });
  });

  describe('GET /api/tabla/:snp', () => {
    it('devuelve una columna por ciudad, con su cantidad de muestras', async () => {
      const app: Express = await cargarApp();
      const respuesta: request.Response = await request(app).get(`/api/tabla/${SNP}`);
      expect(respuesta.status).toBe(200);
      const tabla: Tabla = respuesta.body as Tabla;
      expect(tabla.ciudades).toEqual([
        { nombre: 'AMBA', cantidad: 168 },
        { nombre: 'Cuyo', cantidad: 33 },
        { nombre: 'Bahía Blanca', cantidad: 95 },
        { nombre: 'Comodoro Rivadavia', cantidad: 60 },
        { nombre: 'Esquel', cantidad: 48 },
        { nombre: 'Salta', cantidad: 37 },
      ]);
    });

    it('devuelve una fila por genotipo con una frecuencia por ciudad', async () => {
      const app: Express = await cargarApp();
      const respuesta: request.Response = await request(app).get(`/api/tabla/${SNP}`);
      const tabla: Tabla = respuesta.body as Tabla;
      expect(tabla.snp).toBe(SNP);
      expect(tabla.filas).toHaveLength(3);
      expect(tabla.filas[0].genotipo).toBe('CC');
      expect(tabla.filas[1].genotipo).toBe('CT');
      expect(tabla.filas[2].genotipo).toBe('TT');
      expect(tabla.filas[1].frecuencias).toHaveLength(6);
      expect(tabla.filas[1].frecuencias[0]).toBeCloseTo(53 / 168, 10);
      expect(tabla.filas[1].frecuencias[5]).toBeCloseTo(15 / 37, 10);
    });

    it('un SNP que no existe da 404', async () => {
      const app: Express = await cargarApp();
      const respuesta: request.Response = await request(app).get('/api/tabla/rsNoExiste');
      expect(respuesta.status).toBe(404);
    });
  });
});
