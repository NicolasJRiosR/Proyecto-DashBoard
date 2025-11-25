<script> 
  // Graficos
  import DistribucionQuintiles from "./componentes/graficos/distribucion_quintilies_nacional.svelte"; 
  import MapaEspaña from "./componentes/graficos/mapaEspaña.svelte"; 
  import CurvaMovilidadNacional from "./componentes/graficos/curva_movilidad_nacional.svelte"; 
  
  // Tablas
  import TablaQuintiles from "./componentes/tablas/tabla_quintiles.svelte";
  import TablaEspaña from "./componentes/tablas/tabla_españa.svelte";
  import TablaCurvaMovilidad from "./componentes/tablas/tabla_curva_movilidad.svelte";
  
  import { onMount } from "svelte"; 
  
  let dark = false; 
  let disabled = false;   // 🔁 estado para bloquear el botón
  
  function toggleDark() { 
    if (disabled) return; // si está bloqueado, no hace nada
    
    dark = !dark; 
    document.documentElement.classList.toggle("dark", dark); 
    localStorage.setItem("theme", dark ? "dark" : "light"); 

    window.dispatchEvent(new CustomEvent("modoCambiado"));

    // Bloquear el boton
    disabled = true;
    setTimeout(() => {
      disabled = false;
    }, 600); 
  } 
  
  onMount(() => { 
    window.addEventListener("modoCambiado", () => renderChart(data));

    const saved = localStorage.getItem("theme"); 
    if (saved === "dark") { 
      dark = true; 
      document.documentElement.classList.add("dark"); 
    } 
  }); 
</script>


<!-- Cabecera general del dashboard -->
<header class="w-full bg-[#D85858] dark:bg-[#590811] px-[30px] py-[20px] border border-black dark:border-[#8a9095]">
  <div class="flex items-center gap-[20px] relative">
    <button
      class="bg-white dark:bg-[#1d2022] rounded-md px-[15px] py-[4px] text-[25px] cursor-pointer border border-black dark:border-[#8a9095] text-black dark:text-white"
      aria-label="Modo Oscuro" 
      on:click={toggleDark}
      disabled={disabled}
    >
      ☾☼
    </button>
    <h1 class="absolute left-1/2 -translate-x-1/2 text-black dark:text-white text-[34px] font-bold">ESCALERA SOCIAL</h1>
  </div>
</header>



<main class="p-6 bg-gray-100 dark:bg-[#2a2e31] min-h-screen text-gray-900 dark:text-white">
  <!-- Título principal -->
  <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Nacional</h1>

  <!-- Contenedor general visual -->
  <div class="bg-white dark:bg-[#1d2022] rounded-xl p-6 shadow-md border border-gray-300 dark:border-[#8a9095]">
    <!-- Grid de 2 columnas para tablas y gráficos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Fila 1: Quintiles -->
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-5 text-gray-900 dark:text-white ml-[153px]">Tabla de Datos de Quintiles Nacional</h2>
        <TablaQuintiles class="w-full" />
      </div>
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-5 text-gray-900 dark:text-white ml-[275px]">Distribución Quintiles Nacional</h2>
        <DistribucionQuintiles />
      </div>

      <!-- Fila 2: España -->
      <div class="mt-16">
        <h2 class="text-xl font-semibold mb-5 text-gray-900 dark:text-white ml-[180px]">Tabla de Centiles por CCAA</h2>
        <TablaEspaña />
      </div>
      <div class="mt-16">
        <h2 class="text-xl font-semibold mb-5 text-gray-900 dark:text-white ml-[200px]">Mapa de España por CCAA</h2>
        <MapaEspaña />
      </div>

      <!-- Fila 3: Curva Movilidad -->
      <div class="mt-20">
        <h2 class="text-xl font-semibold mb-5 text-gray-900 dark:text-white ml-[170px]">Tabla de Centiles Padres-Hijos</h2>
        <TablaCurvaMovilidad />
      </div>
      <div class="mt-20">
        <h2 class="text-xl font-semibold mb-5 text-gray-900 dark:text-white ml-[249px]">Curva de Movilidad Nacional</h2>
        <CurvaMovilidadNacional />
      </div>
    </div>
  </div>
</main>


<style>
  :global(html), 
  :global(body), 
  :global(header), 
  :global(main), 
  :global(div), 
  :global(h1), 
  :global(h2) {
    transition: background-color 0.4s ease, color 0.4s ease;
  }
</style>

