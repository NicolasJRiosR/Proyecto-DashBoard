<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  let data = [];
  let chartEl;

  onMount(async () => {
    const res = await fetch("/api/quintiles/nacional");
    const rawData = await res.json();

    const hijosQuintiles = ["0-20", "20-40", "40-60", "60-80", "80-100"];

    data = rawData
      .map(d => ({
        quintil_padres: d.quintil_padres.trim(),
        hijos_quintil: hijosQuintiles.find(h => h === d.hijos_quintil.trim()) || d.hijos_quintil.trim(),
        porcentaje: Number(d.porcentaje)
      }))
      .filter(d => !isNaN(d.porcentaje));

    renderChart();
  });

  function renderChart() {
    const width = 1100;
    const height = 430;
    const margin = { top: 90, right: 140, bottom: 80, left: 70 };

    d3.select(chartEl).selectAll("*").remove();

    const svg = d3.select(chartEl)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "#f7f7f7")
      .attr("rx", 8);

    const hijosQuintiles = ["0-20", "20-40", "40-60", "60-80", "80-100"];

    const x0 = d3.scaleBand()
      .domain([...new Set(data.map(d => d.quintil_padres))])
      .range([margin.left, width - margin.right])
      .padding(0.05);

    const x1 = d3.scaleBand()
      .domain(hijosQuintiles)
      .range([0, x0.bandwidth()])
      .padding(0.12);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.porcentaje)])
      .nice()
      .range([height - margin.bottom, margin.top]);

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

    // Títulos
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "22px")
      .attr("font-weight", "bold")
      .text("Movilidad intergeneracional por quintiles");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2 + 18)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .text("Distribución de los hijos según el quintil socioeconómico de los padres");

    // Ejes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0));

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("font-size", 14)
      .text("Quintil de los padres");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"));

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(25, ${height / 2}) rotate(-90)`)
      .attr("font-size", 14)
      .text("Porcentaje de hijos");

    const grouped = Array.from(d3.group(data, d => d.quintil_padres), ([key, values]) => ({ key, values }));

    const grupos = svg.selectAll("g.barra")
      .data(grouped)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.key)},0)`);

    // Nueva paleta de colores
    const colorPalette = ["#e41a1c", "#ff7f00", "#ffff33", "#4daf4a", "#377eb8"];

    grupos.each(function(group) {
      const groupColor = d3.scaleOrdinal()
        .domain(hijosQuintiles)
        .range(colorPalette);

      d3.select(this).selectAll("rect")
        .data(group.values)
        .enter()
        .append("rect")
        .attr("x", d => x1(d.hijos_quintil))
        .attr("y", d => y(d.porcentaje))
        .attr("width", x1.bandwidth())
        .attr("height", d => y(0) - y(d.porcentaje))
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", d => groupColor(d.hijos_quintil))
        .on("mousemove", (event, d) => {
          tooltip.style("opacity", 1)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 20 + "px")
            .html(`<strong>Padres:</strong> ${d.quintil_padres}<br><strong>Hijo:</strong> ${d.hijos_quintil}<br><strong>Porcentaje:</strong> ${d.porcentaje.toFixed(1)}%`);
        })
        .on("mouseleave", () => tooltip.style("opacity", 0));

      // Etiquetas sobre barras
      d3.select(this).selectAll("text.barra-label")
        .data(group.values)
        .enter()
        .append("text")
        .attr("class", "barra-label")
        .attr("x", d => x1(d.hijos_quintil) + x1.bandwidth() / 2)
        .attr("y", d => y(d.porcentaje) - 6)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .text(d => d.porcentaje.toFixed(1) + "%");
    });

    // Leyenda
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 25}, ${margin.top})`);

    hijosQuintiles.forEach((hijo, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 22})`);
      g.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorPalette[i]);
      g.append("text")
        .attr("x", 22)
        .attr("y", 12)
        .attr("font-size", 12)
        .text(hijo);
    });
  }
</script>

<style>
  :global(svg) { font-family: sans-serif; }
  :global(#tooltip) { box-shadow: 0 0 6px rgba(0,0,0,0.2); }
  :global(rect) { transition: opacity 0.2s; }
  :global(rect:hover) { opacity: 0.7; }
</style>

<div bind:this={chartEl}></div>
