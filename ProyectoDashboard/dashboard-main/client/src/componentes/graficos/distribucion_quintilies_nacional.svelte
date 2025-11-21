<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  let data = [];
  let chartEl;

  onMount(async () => {
    const res = await fetch("/api/quintiles/nacional");
    const rawData = await res.json();

    // Convertir porcentaje a número y filtrar filas inválidas
    data = rawData
      .map(d => ({
        quintil_padres: d.quintil_padres,   // texto
        hijos_quintil: d.hijos_quintil,     // texto
        porcentaje: Number(d.porcentaje)    // número
      }))
      .filter(d => !isNaN(d.porcentaje));   // elimina filas inválidas

    renderChart();
  });

  function renderChart() {
    const width = 700;
    const height = 400;
    const margin = { top: 50, right: 100, bottom: 50, left: 60 };

    d3.select(chartEl).selectAll("*").remove();

    const svg = d3.select(chartEl)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Escala X para quintil_padres
    const x0 = d3.scaleBand()
      .domain(data.map(d => d.quintil_padres))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    // Escala X interna para hijos_quintil
    const hijosQuintiles = Array.from(new Set(data.map(d => d.hijos_quintil)));
    const x1 = d3.scaleBand()
      .domain(hijosQuintiles)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    // Escala Y para porcentaje
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.porcentaje)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Colores
    const color = d3.scaleOrdinal(d3.schemeTableau10)
      .domain(hijosQuintiles);

    // Ejes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"));

    // Barras
    const grupos = svg.selectAll("g.barra")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.quintil_padres)},0)`);

    grupos.append("rect")
      .attr("x", d => x1(d.hijos_quintil))
      .attr("y", d => y(d.porcentaje))
      .attr("width", x1.bandwidth())
      .attr("height", d => y(0) - y(d.porcentaje))
      .attr("fill", d => color(d.hijos_quintil))
      .attr("class", "bar");

    // Etiquetas
    grupos.append("text")
      .attr("x", d => x1(d.hijos_quintil) + x1.bandwidth() / 2)
      .attr("y", d => y(d.porcentaje) - 5)
      .attr("text-anchor", "middle")
      .attr("class", "label")
      .text(d => d.porcentaje != null ? d.porcentaje.toFixed(1) + "%" : "");

    // Leyenda
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

    hijosQuintiles.forEach((hijo, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      g.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(hijo));
      g.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(hijo)
        .attr("font-size", 12);
    });
  }
</script>

<style>
  :global(svg) {
    font-family: sans-serif;
  }
  :global(.bar) {
    transition: fill 0.2s;
  }
  :global(.label) {
    font-size: 12px;
    font-weight: bold;
  }
</style>

<div bind:this={chartEl}></div>
