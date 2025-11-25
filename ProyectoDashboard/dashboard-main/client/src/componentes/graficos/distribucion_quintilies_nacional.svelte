<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  let data = [];
  let chartEl;

  onMount(async () => {
    const res = await fetch("/api/quintiles/nacional");
    const rawData = await res.json();

    data = rawData.map(d => ({
      padres: d.quintil_padres.trim(),
      hijos: d.hijos_quintil.trim(),
      porcentaje: Number(d.porcentaje)
    })).filter(d => !isNaN(d.porcentaje));

    renderChart();
    window.addEventListener("resize", renderChart);
  });

  function renderChart() {
    if (!chartEl || data.length === 0) return;

    const containerWidth = chartEl.clientWidth || 850;
    const width = Math.min(containerWidth, 900);
    const height = width * 0.60;
    const margin = { top: 90, right: 60, bottom: 90, left: 120 };

    d3.select(chartEl).selectAll("*").remove();

    const svg = d3.select(chartEl)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const padresQuintiles = [...new Set(data.map(d => d.padres))];
    const hijosQuintiles = ["0-20","20-40","40-60","60-80","80-100"];

    const x = d3.scaleBand()
      .domain(hijosQuintiles)
      .range([margin.left, width - margin.right])
      .padding(0.05);

    const y = d3.scaleBand()
      .domain(padresQuintiles)
      .range([margin.top, height - margin.bottom])
      .padding(0.05);

    const color = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.porcentaje)]);

    const tooltip = d3.select("body")
      .append("div")
      .attr("id","tooltip")
      .style("position","absolute")
      .style("padding","6px 10px")
      .style("background","white")
      .style("border","1px solid #ccc")
      .style("border-radius","4px")
      .style("pointer-events","none")
      .style("opacity",0)
      .style("font-size","12px");

    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.hijos))
      .attr("y", d => y(d.padres))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", d => color(d.porcentaje))
      .attr("stroke","#fff")
      .on("mousemove", (event,d) => {
        tooltip.style("opacity",1)
          .style("left", event.pageX+10+"px")
          .style("top", event.pageY-20+"px")
          .html(`<strong>Padres:</strong> ${d.padres}<br>
                 <strong>Hijo:</strong> ${d.hijos}<br>
                 <strong>Porcentaje:</strong> ${d.porcentaje}%`);
      })
      .on("mouseleave", () => tooltip.style("opacity",0));

    svg.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", d => x(d.hijos) + x.bandwidth()/2)
      .attr("y", d => y(d.padres) + y.bandwidth()/2 + 4)
      .attr("text-anchor","middle")
      .attr("font-size", 12)
      .attr("fill", d => d.porcentaje > d3.max(data, d=>d.porcentaje)/2 ? "white":"black")
      .text(d => d.porcentaje.toFixed(1) + "%");

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", width/2)
      .attr("y", 50)
      .attr("text-anchor","middle")
      .attr("font-size", 20)
      .attr("font-weight","bold")
  }
</script>

<div class="chart" bind:this={chartEl}></div>

<style>
  .chart {
    width: 100%;
  }

  :global(svg){
    width: 100%;
    height: auto;
    max-width: 900px;
    font-family: sans-serif;
  }

  :global(#tooltip){
    box-shadow:0 0 6px rgba(0,0,0,0.2);
  }
</style>
