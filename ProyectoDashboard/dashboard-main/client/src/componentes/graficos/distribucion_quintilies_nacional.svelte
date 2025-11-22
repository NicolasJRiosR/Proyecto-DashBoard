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
        quintil_padres: d.quintil_padres,
        hijos_quintil: d.hijos_quintil,
        porcentaje: Number(d.porcentaje)
      }))
      .filter(d => !isNaN(d.porcentaje));

    renderChart();
  });

  function renderChart() {
    const width = 700;
    const height = 430;
    const margin = { top: 70, right: 140, bottom: 60, left: 70 };

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

    // ----- Título -----
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "22px")
      .attr("font-weight", "bold")
      .text("Movilidad intergeneracional por quintiles");

    // Subtítulo
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2 + 18)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .text("Distribución de los hijos según el quintil socioeconómico de los padres");

    // Eje X
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0));

    // Etiqueta eje X
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("font-size", 14)
      .text("Quintil de los padres");

    // Eje Y
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"));

    // Etiqueta eje Y
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(25, ${height / 2}) rotate(-90)`)
      .attr("font-size", 14)
      .text("Porcentaje de hijos");

    // Tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("padding", "6px 10px")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("font-size", "12px");

    // Grupos de barras
    const grupos = svg.selectAll("g.barra")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.quintil_padres)},0)`);

    // Barras
    grupos.append("rect")
      .attr("x", d => x1(d.hijos_quintil))
      .attr("y", d => y(d.porcentaje))
      .attr("width", x1.bandwidth())
      .attr("height", d => y(0) - y(d.porcentaje))
      .attr("fill", d => color(d.hijos_quintil))
      .on("mousemove", (event, d) => {
        tooltip.style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px")
          .html(`
            <strong>Padres:</strong> ${d.quintil_padres}<br>
            <strong>Hijo:</strong> ${d.hijos_quintil}<br>
            <strong>Porcentaje:</strong> ${d.porcentaje}%
          `);
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });

    // Labels
    grupos.append("text")
      .attr("x", d => x1(d.hijos_quintil) + x1.bandwidth() / 2)
      .attr("y", d => y(d.porcentaje) - 6)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .text(d => d.porcentaje.toFixed(1) + "%");

    // Leyenda
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 25}, ${margin.top})`);

    hijosQuintiles.forEach((hijo, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 22})`);
      g.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(hijo));
      g.append("text")
        .attr("x", 22)
        .attr("y", 12)
        .attr("font-size", 12)
        .text(hijo);
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
  :global(#tooltip) {
    box-shadow: 0 0 6px rgba(0,0,0,0.2);
  }
</style>

<div bind:this={chartEl}></div>
