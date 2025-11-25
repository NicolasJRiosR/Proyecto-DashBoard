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
    const width = 600;
    const height = 450;
    const margin = { top: 50, right: 40, bottom: 50, left: 60 };

    d3.select(chartEl).selectAll("*").remove();

    const svg = d3.select(chartEl)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "white" : "black";

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.padresCentil))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.hijosCentil))
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Eje X
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
    // Eje Y
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))


    // Etiquetas adaptadas al modo claro/oscuro
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("fill", textColor)
    .text("Centil de los padres");

  svg.append("text")
    .attr("transform", `rotate(-90)`)
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("fill", textColor)
    .text("Centil medio de los hijos");


    // Línea de referencia
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
      .attr("fill", textColor)
      .text("Hijos = Padres");

    legend.append("line")
      .attr("x1", 0).attr("y1", 20)
      .attr("x2", 20).attr("y2", 20)
      .attr("stroke", "#457b9d")
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 22)
      .style("font-size", "12px")
      .attr("fill", textColor)
      .text("Curva de movilidad real");
  }
</script>

<div bind:this={chartEl} class="bg-white dark:bg-[#1d2022] p-4 rounded-lg"></div>

<style>
  :global(svg) {
    font-family: sans-serif;
  }
  :global(circle:hover) {
    stroke: black;
    stroke-width: 1.5;
    r: 4;
  }
  :global(svg) {
    font-family: sans-serif;
  }
  :global(circle:hover) {
    stroke: black;
    stroke-width: 1.5;
    r: 4;
  }

  /* ← AÑADE ESTO */
  :global(svg text) {
    fill: black;
  }
  :global(.dark svg text) {
    fill: white;
  }
</style>