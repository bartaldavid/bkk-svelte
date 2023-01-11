<script lang="ts">
  import type IconBase from "svelte-icons/components/IconBase.svelte";
  import {
    MdDirectionsBus,
    MdDirectionsRailway,
    MdSubway,
    MdTram,
  } from "svelte-icons/md/";
  import type { components } from "../data/bkk-openapi";

  export let vehicleType: string;

  type typeMap = {
    [key in components["schemas"]["TransitStop"]["type"]]?: IconBase;
  };

  // TODO replace these with material icons from css
  export const typesToIconsMap: typeMap = {
    RAIL: MdDirectionsRailway,
    BUS: MdDirectionsBus,
    SUBWAY: MdSubway,
    TRAM: MdTram,
    TROLLEYBUS: MdDirectionsBus, // FIXME no trolleybus icon
    SUBURBAN_RAILWAY: MdDirectionsRailway,
  };
</script>

{#if vehicleType}
  <span class="ml-1 inline-flex h-7 w-12 self-center pr-3">
    <svelte:component
      this={typesToIconsMap[vehicleType]}
      class="fill-slate-500"
    />
  </span>
{/if}
