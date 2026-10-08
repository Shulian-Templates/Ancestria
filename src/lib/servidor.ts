import express from 'express';
import type { Express, Request, Response } from 'express';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import open from 'open';

const __dir: string = dirname(fileURLToPath(import.meta.url));
const frontendDir: string = join(__dir, '../../frontend');

/** Un pedido del browser. `req.params` y `req.body` son objetos de texto. */
export type Pedido = Request<Record<string, string>, unknown, Record<string, string>>;

/** La respuesta que se le manda al browser. Se contesta con `res.json(...)`. */
export type Respuesta = Response;

export const app: Express = express();

app.use(express.json());
app.use(express.static(frontendDir));

/**
 * Inicia el servidor y abre el browser automáticamente.
 * @param puerto - Puerto en el que escucha el servidor (por defecto: 3000).
 */
export function iniciar(puerto: number = 3000): void {
  app.listen(puerto, (): void => {
    const url: string = `http://localhost:${puerto}`;
    console.log(`Página en ${url}`);
    void open(url);
  });
}
