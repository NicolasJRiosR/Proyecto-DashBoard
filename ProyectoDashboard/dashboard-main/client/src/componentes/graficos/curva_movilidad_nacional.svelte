<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  let chartEl;
  let data = [];

  onMount(async () => {
    const res = await fetch("/api/nacional/curva");
    if (!res.ok) throw new Error("Error al cargar datos");
    const rawData = await res.json();

    data = rawData
      .map(d => ({
        padresCentil: +d.centil_padres,
        hijosCentil: +d.centil_hijo_loess
      }))
      .filter(d => !isNaN(d.padresCentil) && !isNaN(d.hijosCentil));

    renderChart(data);
  });

  function renderChart(data) {
    const width = 600;   // igual ancho que tabla
    const height = 450;
    const margin = { top: 50, right: 40, bottom: 50, left: 60 };

    d3.select(chartEl).selectAll("*").remove();

    const svg = d3.select(chartEl)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.padresCentil))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.hijosCentil))
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Ejes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Etiquetas
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Centil de los padres");

    svg.append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Centil medio de los hijos");

    // Línea de referencia (hijos = padres)
    const minVal = Math.max(d3.min(data, d => d.padresCentil), d3.min(data, d => d.hijosCentil));
    const maxVal = Math.min(d3.max(data, d => d.padresCentil), d3.max(data, d => d.hijosCentil));

    svg.append("line")
      .attr("x1", x(minVal))
      .attr("y1", y(minVal))
      .attr("x2", x(maxVal))
      .attr("y2", y(maxVal))
      .attr("stroke", "gray")
      .attr("stroke-dasharray", "4 4")
      .attr("stroke-width", 2);

    // Curva azul
    const line = d3.line()
      .x(d => x(d.padresCentil))
      .y(d => y(d.hijosCentil))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#457b9d")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("padding", "6px 8px")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("font-size", "13px")
      .style("box-shadow", "0 2px 6px rgba(0,0,0,0.15)");

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.padresCentil))
      .attr("cy", d => y(d.hijosCentil))
      .attr("r", 2)
      .attr("fill", "#457b9d")
      .on("mousemove", (event, d) => {
        tooltip.style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px")
          .html(`<strong>Centil padres:</strong> ${d.padresCentil}<br><strong>Centil hijos:</strong> ${d.hijosCentil}`);
      })
      .on("mouseleave", () => tooltip.style("opacity", 0));

    // Leyenda
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right - 120},${margin.top})`);

    legend.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 20).attr("y2", 0)
      .attr("stroke", "gray")
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 2)   
      .style("font-size", "12px")   
      .text("Hijos = Padres");

    legend.append("line")
      .attr("x1", 0).attr("y1", 20)
      .attr("x2", 20).attr("y2", 20)
      .attr("stroke", "#457b9d")
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 22)  
      .style("font-size", "12px")   
      .text("Curva de movilidad real");
  }
</script>

<style>
  :global(svg) {
    font-family: sans-serif;
  }
  :global(circle:hover) {
    stroke: black;
    stroke-width: 1.5;
    r: 4;
  }

.outer {
  width: 100%;
  display: flex;
  justify-content: flex-start; /* alineación izquierda */
  gap: 36px;
  flex-wrap: wrap;
  padding: 20px 20px 20px 80px; /* igual que antes */
  box-sizing: border-box;
}

  .tabla-container {
    width: 100%;
    max-width: 600px; /* igual ancho que otras tablas y gráfico */
    max-height: 450px;
    overflow-y: auto;
    border: 1px solid #e5e5e5;
    padding: 16px;
    border-radius: 8px;
    background: #fafafa;
    box-sizing: border-box;
  }

  .tabla-container h3 {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  th {
    background: #e9edf5;
    padding: 6px;
    font-weight: bold;
    border-bottom: 1px solid #ccc;
  }

  td {
    padding: 6px;
    border-bottom: 1px solid #eee;
  }

  tr:nth-child(even) {
    background: #f7f9fc;
  }
</style>

<div class="outer">
  <!-- Tabla de datos -->
  <div class="tabla-container">
    <h3>Centiles Padres-Hijos</h3>
    <table>
      <thead>
        <tr>
          <th>Centil Padres</th>
          <th>Centil Hijos</th>
        </tr>
      </thead>
      <tbody>
        {#each data as row}
          <tr>
            <td>{row.padresCentil}</td>
            <td>{row.hijosCentil}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Gráfico -->
  <div bind:this={chartEl}></div>
</div>
