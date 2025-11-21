<script>
  export let apiBase;

  let data = [];
  let columns = [
    "id",
    "nombre",
    "edad",
    "sexo",
    "provincia",
    "municipio",
    "renta_personal",
    "renta_parental",
    "educacion_profesion_parental"
  ];
  let q = "";

  async function load() {
    const res = await fetch(`${apiBase}/api/datos`); // tu endpoint real
    const json = await res.json();
    data = json.data; // asegúrate de que el backend devuelva { data: [...] }
  }

  // Filtrado reactivo
  $: filtered = q
    ? data.filter(row =>
        Object.values(row).some(v =>
          String(v).toLowerCase().includes(q.toLowerCase())
        )
      )
    : data;

  load();
</script>

<div>
  <input
    placeholder="Filtrar…"
    bind:value={q}
    class="w-full p-2 mb-3 border rounded bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
  />

  <div style="overflow:auto;">
    <table class="table-auto w-full border-collapse text-sm">
      <thead class="bg-gray-200 dark:bg-gray-700">
        <tr>
          {#each columns as c}
            <th class="px-3 py-2 border-b">{c}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each filtered as row}
          <tr>
            {#each columns as c}
              <td class="px-3 py-2 border-b">{row[c]}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
