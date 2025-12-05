<script>
  import { onMount } from "svelte";
  let data = [];

  onMount(async () => {
    const res = await fetch("/api/quintiles/nacional");
    const rawData = await res.json();

    data = rawData.map(d => ({
      padres: d.quintil_padres.trim(),
      hijos: d.hijos_quintil.trim(),
      porcentaje: Number(d.porcentaje)
    })).filter(d => !isNaN(d.porcentaje));
  });
</script>

<div class="w-[101%] max-w-xl max-h-[450px] overflow-y-auto 
            border border-[#e5e5e5] dark:border-[#8a9095] 
            rounded-lg 
            bg-[#fafafa] dark:bg-[#1d2022] 
            p-4 
            text-black dark:text-white
            ml-10">
    
  <table class="w-full border-collapse text-sm">
    <thead>
      <tr class="bg-[#e9edf5] dark:bg-[#2a2e31]">
        <th class="py-2 px-3 text-left border-b border-[#ccc] dark:border-[#8a9095]">Padres</th>
        <th class="py-2 px-3 text-left border-b border-[#ccc] dark:border-[#8a9095]">Hijos</th>
        <th class="py-2 px-3 text-left border-b border-[#ccc] dark:border-[#8a9095]">%</th>
      </tr>
    </thead>
    <tbody>
      {#each data as row, i}
        <tr class={i % 2 === 0 
          ? 'bg-[#f7f9fc] dark:bg-[#242728]' 
          : 'bg-white dark:bg-[#1d2022]'}>
          <td class="py-2 px-3 border-b border-[#eee] dark:border-[#8a9095]">{row.padres}</td>
          <td class="py-2 px-3 border-b border-[#eee] dark:border-[#8a9095]">{row.hijos}</td>
          <td class="py-2 px-3 border-b border-[#eee] dark:border-[#8a9095]">{row.porcentaje}%</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>