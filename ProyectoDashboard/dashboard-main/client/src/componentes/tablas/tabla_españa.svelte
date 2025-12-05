<script>
  import { onMount } from "svelte";
  let datosCCAA = [];
  let loading = true;
  let errorMsg = "";

  onMount(async () => {
    try {
      const res = await fetch("http://localhost:3033/api/ccaa/ranking");
      if (!res.ok) throw new Error("API no disponible");
      datosCCAA = await res.json();
      loading = false;
    } catch (e) {
      errorMsg = e.message;
      loading = false;
      console.error(e);
    }
  });
</script>

<div class="w-full max-w-xl max-h-[450px] overflow-y-auto 
            border border-[#e5e5e5] dark:border-[#8a9095] 
            rounded-lg 
            bg-[#fafafa] dark:bg-[#1d2022] 
            p-4 
            text-black dark:text-white ml-10">
    
  <table class="w-full border-collapse text-sm">
    <thead>
      <tr class="bg-[#e9edf5] dark:bg-[#2a2e31]">
        <th class="py-2 px-3 text-left border-b border-[#ccc] dark:border-[#8a9095]">CCAA</th>
        <th class="py-2 px-3 text-left border-b border-[#ccc] dark:border-[#8a9095]">Centil Hijo</th>
      </tr>
    </thead>
    <tbody>
      {#each datosCCAA as row, i}
        <tr class={i % 2 === 0 
          ? 'bg-[#f7f9fc] dark:bg-[#242728]' 
          : 'bg-white dark:bg-[#1d2022]'}>
          <td class="py-2 px-3 border-b border-[#eee] dark:border-[#8a9095]">{row.ccaa}</td>
          <td class="py-2 px-3 border-b border-[#eee] dark:border-[#8a9095]">{row.centil_hijo}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if loading}
    <p class="text-center text-sm mt-2 text-gray-600 dark:text-gray-300">Cargando tabla...</p>
  {:else if errorMsg}
    <p class="text-center text-sm mt-2 text-red-600 dark:text-red-400">{errorMsg}</p>
  {/if}
</div>