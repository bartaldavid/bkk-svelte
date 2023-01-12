<script lang="ts">
  import type { components } from "../data/bkk-openapi";
  import { selectedStopID } from "../data/stores";
  import VehicleIcons from "./VehicleIcons.svelte";

  // FIXME this probably should be strongly typed
  export let groupType: string;
  export let groupItems: components["schemas"]["TransitStop"][];
  export let getStopData: (stopId: string) => void;
</script>

<div class="mb-1 flex flex-row rounded bg-slate-50 p-2">
  <div class="flex">
    <VehicleIcons vehicleType={groupType} />
  </div>
  <div class="flex flex-wrap gap-1">
    {#each groupItems as stop}
      <button
        class="flex-1 break-words rounded bg-slate-100 p-2 text-sm"
        on:click={() => {
          $selectedStopID = stop.id ?? "";
          getStopData(stop.id ?? "");
        }}
        >{stop.name}
      </button>
    {/each}
  </div>
</div>
