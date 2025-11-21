import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";
//cambioscambiados
import {
  nacionalColumns,
  ccaaColumns,
  quintilesNacionalColumns,
  conversorHijosColumns,
  conversorPadresColumns
} from "./columnascolocada.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3033;

app.use(cors());
app.use(express.json());

const DATA_DIR = process.env.DATA_DIR || path.resolve("./data");

const cache = {};

function loadCsv(fileName, options = {}) {
  const { separator = ",", encoding = "utf-8" } = options;
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(DATA_DIR, fileName);

    fs.createReadStream(filePath, { encoding })
      .pipe(csv({ separator }))
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

async function getDataset(key, fileName) {
  if (!cache[key]) {
    console.log(` Cargando ${fileName}...`);
    cache[key] = await loadCsv(fileName);
    console.log(` ${fileName} cargado (${cache[key].length} filas)`);
  }
  return cache[key];
}


app.get("/api/nacional/curva", async (req, res) => {
  try {
    const datos = await getDataset("curva_nacional", "curva_movilidad_nacional.csv");

    const sexoFiltro = req.query.sexo || "total";
    const tipoRentaFiltro = req.query.tipo_renta || "individual";

    let filtrados = datos;
    if (datos[0][nacionalColumns.sexo] !== undefined) {
      filtrados = filtrados.filter((d) => d[nacionalColumns.sexo] === sexoFiltro);
    }
    if (datos[0][nacionalColumns.tipoRenta] !== undefined) {
      filtrados = filtrados.filter((d) => d[nacionalColumns.tipoRenta] === tipoRentaFiltro);
    }

    const salida = filtrados
      .map((d) => {
        const centil_padres = Number(d[nacionalColumns.padresCentil]);
        const centil_hijo =
          d[nacionalColumns.hijosCentil] !== undefined
            ? Number(d[nacionalColumns.hijosCentil])
            : d.centil_hijo !== undefined
            ? Number(d.centil_hijo)
            : Number(d.promedio);

        return {
          sexo: d[nacionalColumns.sexo],
          tipo_renta: d[nacionalColumns.tipoRenta],
          centil_padres,
          centil_hijo,
          centil_hijo_bruto: d.centil_hijo ? Number(d.centil_hijo) : null,
          centil_hijo_loess: d[nacionalColumns.hijosCentil]
            ? Number(d[nacionalColumns.hijosCentil])
            : null,
          n: d.n ? Number(d.n) : null
        };
      })
      .sort((a, b) => a.centil_padres - b.centil_padres);

    res.json(salida);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando curva nacional" });
  }
});


app.get("/api/ccaa/ranking", async (req, res) => {
  try {
    const datos = await getDataset("ranking_ccaa_p20", "ranking_ccaa_centil_padres_20.csv");

    const salida = datos
      .map((d) => ({
        ccaa: d[ccaaColumns.nombreComunidadAutonoma],
        centil_padres: 20,
        centil_hijo: Number(d[ccaaColumns.hijosCentil])
      }))
      .sort((a, b) => b.centil_hijo - a.centil_hijo);

    res.json(salida);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando ranking CCAA" });
  }
});


app.get("/api/quintiles/nacional", async (req, res) => {
  try {
    const datos = await getDataset("quintiles_nacional", "distribucion_quintiles_nacional_padres_hijos.csv");

    const salida = datos.map((d) => ({
      quintil_padres: Number(d[quintilesNacionalColumns.padresQuintil]),
      hijos_quintil: Number(d[quintilesNacionalColumns.hijosQuintil]),
      porcentaje: Number(d[quintilesNacionalColumns.porcentaje])
    }));

    res.json(salida);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando quintiles nacionales" });
  }
});


app.get("/api/conversor/hijos", async (req, res) => {
  try {
    const datos = await getDataset("conv_hijos", "conversor_centiles_a_euros_hijos.csv");
    res.json(datos.map((d) => ({
      centil: Number(d[conversorHijosColumns.centil_hijos]),
      renta: Number(d[conversorHijosColumns.renta_hijos])
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando conversor hijos" });
  }
});


app.get("/api/conversor/padres", async (req, res) => {
  try {
    const datos = await getDataset("conv_padres", "conversor_centiles_a_euros_padres.csv");
    res.json(datos.map((d) => ({
      centil: Number(d[conversorPadresColumns.centil_padres]),
      renta: Number(d[conversorPadresColumns.renta_padres])
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando conversor padres" });
  }
});


app.listen(PORT, () => {
  console.log(`Funciona http://localhost:${PORT}`);
});
