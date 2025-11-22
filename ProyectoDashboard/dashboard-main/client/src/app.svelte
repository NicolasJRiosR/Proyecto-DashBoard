<script>
  import DistribucionQuintiles from "./componentes/graficos/distribucion_quintilies_nacional.svelte";
  import MapaEspaña from "./componentes/graficos/mapaEspaña.svelte";
  import CurvaMovilidadNacional from "./componentes/graficos/curva_movilidad_nacional.svelte"; 
</script>

<main class="p-6 bg-gray-50 min-h-screen">
  <!-- Título principal -->
  <h1 class="text-3xl font-bold text-blue-700 mb-6">Dashboard Nacional</h1>

  <!-- Contenedor tipo grid para los gráficos -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    <!-- Gráfico de distribución de quintiles -->
    <div class="shadow-lg rounded-lg bg-white p-4">
      <h2 class="text-xl font-semibold mb-4">Distribución Quintiles Nacional</h2>
      <DistribucionQuintiles />
    </div>

    <!-- Mapa de España -->
    <div class="shadow-lg rounded-lg bg-white p-4">
      <h2 class="text-xl font-semibold mb-4">Mapa de España por CCAA</h2>
      <MapaEspaña />
    </div>

    <!-- Curva de movilidad nacional -->
    <div class="shadow-lg rounded-lg bg-white p-4 md:col-span-2">
      <h2 class="text-xl font-semibold mb-4">Curva de Movilidad Nacional</h2>
      <CurvaMovilidadNacional />
    </div>

  </div>
</main>
