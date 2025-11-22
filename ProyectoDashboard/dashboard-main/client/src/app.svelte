<script>
  import DistribucionQuintiles from "./componentes/graficos/distribucion_quintilies_nacional.svelte";
  import MapaEspaña from "./componentes/graficos/mapaEspaña.svelte";
  import CurvaMovilidadNacional from "./componentes/graficos/curva_movilidad_nacional.svelte"; 
</script>

<!-- Cabecera general del dashboard -->
<header class="cabecera-dashboard">
  <div class="cabecera-contenido">
    <button class="cabecera-boton" aria-label="Modo Oscuro">
       ☾☼
    </button>
    <h1 class="cabecera-titulo">Escalera Social</h1>
  </div>
</header>

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

<style>
  .cabecera-dashboard {  /* Franja verde */
    background-color: #26AD5F;
    width: 100%; /* ocupa todo el ancho */
    padding: 20px 30px; /* altura y espacio lateral */
  }

  .cabecera-contenido {   /* Contenedor interno con botón y título */
    display: flex; /* coloca elementos en fila */
    align-items: center; /* alinea verticalmente */
    gap: 20px; /* espacio entre botón y título */
  }

  .cabecera-titulo { /* Titulo Escalera Social */
    position: absolute; /* se posiciona respecto al contenedor */
    left: 50%; /* punto central del contenedor */
    transform: translateX(-50%); /* lo centra visualmente */
    color: black;
    font-size: 34px;
    font-weight: bold;
  }

  .cabecera-boton { /*Boton*/
    background-color: white;
    border-radius: 6px; /* esquinas redondeadas */
    padding: 4px 15px; /* tamaño */
    font-size: 25px;
    cursor: pointer; /* cursor tipo mano al pasar por encima */
  }

</style>