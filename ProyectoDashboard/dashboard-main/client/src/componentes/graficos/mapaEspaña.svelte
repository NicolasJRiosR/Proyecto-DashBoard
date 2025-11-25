<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { geoConicConformal } from "d3-geo";

  let loading = true;
  let errorMsg = "";
  let datosCCAA = [];

  function normalize(str) {
    return (str ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  const rawNameMap = [
    ["Cataluna", "Cataluna"], ["Aragon", "Aragon"], ["La Rioja", "La Rioja"],
    ["Comunidad de Madrid", "Comunidad de Madrid"], ["Islas Baleares", "Islas Baleares"],
    ["Castilla y León", "Castilla y León"], ["Castilla la Mancha", "Castilla la Mancha"],
    ["Cantabria", "Cantabria"], ["Galicia", "Galicia"], ["Asturias", "Asturias"],
    ["Comunidad Valenciana", "Comunidad Valenciana"], ["Murcia", "Murcia"],
    ["Extremadura", "Extremadura"], ["Islas Canarias", "Islas Canarias"],
    ["Andalucía", "Andalucía"], ["Navarra, Comunidad Foral de", "Navarra, Comunidad Foral de"],
    ["País Vasco", "País Vasco"], ["Ceuta", "Ceuta"], ["Melilla", "Melilla"]
  ];

  const nameMap = new Map(rawNameMap.map(([geo, csv]) => [normalize(geo), normalize(csv)]));
  const displayNameMap = new Map([
    ["andalucia", "Andalucía"], ["aragon", "Aragón"], ["asturias", "Asturias"],
    ["islas baleares", "Islas Baleares"], ["canarias", "Islas Canarias"],
    ["cantabria", "Cantabria"], ["castilla-la mancha", "Castilla-La Mancha"],
    ["castilla y leon", "Castilla y León"], ["cataluna", "Cataluña"], ["ceuta", "Ceuta"],
    ["comunidad de madrid", "Comunidad de Madrid"], ["comunitat valenciana", "Comunidad Valenciana"],
    ["extremadura", "Extremadura"], ["galicia", "Galicia"], ["la rioja", "La Rioja"],
    ["melilla", "Melilla"], ["murcia", "Murcia"], ["navarra", "Navarra"], ["pais vasco", "País Vasco"]
  ]);

  onMount(async () => {
    try {
      const geojson = await d3.json("/data/espana-ccaa.json");
      const res = await fetch("http://localhost:3033/api/ccaa/ranking");
      if (!res.ok) throw new Error("API no disponible");
      datosCCAA = await res.json();

      const valoresPorCCAA = new Map(
        datosCCAA.map(d => [normalize(d.ccaa), Number(d.centil_hijo)])
      );

      const width = 900 * 0.9;
      const height = 440 ;

      const projection = geoConicConformal()
        .center([0, 39])
        .scale(2000 * 0.9)
        .translate([width / 2, height / 2 - 20]);

      const path = d3.geoPath().projection(projection);

      const vals = datosCCAA.map(d => Number(d.centil_hijo)).filter(v => !isNaN(v));
      const minVal = d3.min(vals);
      const maxVal = d3.max(vals);
      const color = d3.scaleSequential(d3.interpolateBlues).domain([minVal, maxVal]);

      const svg = d3.select("#mapa")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const mainGroup = svg.append("g");
      const canariasGroup = svg.append("g");

      geojson.features.forEach(d => {
        const geoKey = normalize(d.properties.name);
        const csvKey = nameMap.get(geoKey) ?? geoKey;
        const v = valoresPorCCAA.get(csvKey);
        const displayName = displayNameMap.get(csvKey) ?? d.properties.name;

        const drawPath = (selection, proj) => {
          selection.append("path")
            .attr("d", d3.geoPath().projection(proj)(d))
            .attr("fill", v !== undefined ? color(v) : "#ccc")
            .attr("stroke", "#333")
            .on("mouseover", (event) => {
              d3.select("#tooltip")
                .style("opacity", 1)
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px")
                .html(`<b>${displayName}</b><br/>centil_hijo: ${v ?? "sin dato"}`);
            })
            .on("mouseout", () => d3.select("#tooltip").style("opacity", 0));
        };

        if (geoKey.includes("canarias")) {
          drawPath(canariasGroup, geoConicConformal().center([0, 28]).scale(700).translate([width * 0.75, height - 60]));
        } else {
          drawPath(mainGroup, projection);
        }
      });

      // Leyenda
      const legendWidth = 220 * 0.9;
      const legendHeight = 10;
      const legendX = 20;
      const legendY = height - 40;

      const legendScale = d3.scaleLinear().domain([minVal, maxVal]).range([0, legendWidth]);
      const legendAxis = d3.axisBottom(legendScale).ticks(4).tickSize(6);

      const defs = svg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("x2", "100%")
        .attr("y1", "0%").attr("y2", "0%");

      gradient.append("stop").attr("offset", "0%").attr("stop-color", color(minVal));
      gradient.append("stop").attr("offset", "100%").attr("stop-color", color(maxVal));

      svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .style("stroke", "#444");

      svg.append("g")
        .attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
        .call(legendAxis);

      loading = false;
    } catch (e) {
      errorMsg = e.message;
      loading = false;
      console.error(e);
    }
  });
</script>

<div id="mapa"></div>
<div id="tooltip"></div>

{#if loading}
  <p>Cargando mapa...</p>
{:else if errorMsg}
  <p style="color: red;">{errorMsg}</p>
{/if}

<style>
  #mapa { position: relative; }
  #tooltip {
  position: absolute;
  background: #fff;
  border: 1px solid #ccc;
  padding: 6px 8px;
  border-radius: 4px;
  pointer-events: none;
  opacity: 0;
  font-size: 13px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  color: #000; /* Forzar texto negro en modo oscuro */
}


  @media (max-width: 900px) {
    #mapa svg {
      max-width: 90%;
    }
  }
</style>
