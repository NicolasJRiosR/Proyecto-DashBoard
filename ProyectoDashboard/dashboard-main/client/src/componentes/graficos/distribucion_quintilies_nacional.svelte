<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  let data = [];
  let chartEl;

  onMount(async () => {
    const res = await fetch("/api/quintiles/nacional");
    const rawData = await res.json();
    data = rawData.map(d => ({
      quintil_padres: Number(d.quintil_padres),
      hijos_quintil: Number(d.hijos_quintil),
      porcentaje: Number(d.porcentaje)
    }));
    renderChart();
  });

  function renderChart() {
    // tu lógica con D3...
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