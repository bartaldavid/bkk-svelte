<script lang="ts">
  import type { components } from "../data/bkk-openapi";
  import { savedStops, savedRouteRef } from "../data/stores";
  import { prevent_default } from "svelte/internal";
  export let references: components["schemas"]["TransitReferences"] = {};
  export let stop: components["schemas"]["TransitStop"] = {};
  $: saved = $savedStops.some((savedStop) => savedStop.id == stop.id);

  function toggleStop(stop: components["schemas"]["TransitStop"]) {
    if (!saved) {
      savedStops.update((prev) => [...prev, stop]);
      let routeRefForStop: {
        [key: string]: components["schemas"]["TransitRoute"] | undefined;
      } = {};
      stop.routeIds?.forEach((routeId) => {
        routeRefForStop[routeId] = references.routes?.[routeId];
      });
      savedRouteRef.update((prev) => {
        return { ...prev, ...routeRefForStop };
      });
    } else {
      savedStops.update((prev) => prev.filter((e) => e.id !== stop.id));
    }
  }
</script>

<div
  class="flex flex-row rounded border p-1 dark:border-none dark:bg-slate-800 dark:p-2"
>
  <div class="flex-1">
    <div class="flex-row">
      <div class="mb-1 dark:text-slate-50">{stop.name}</div>
    </div>
    <div class="flex flex-row flex-wrap gap-1 ">
      {#each stop?.routeIds || [] as routeid}
        {@const routeRef =
          $savedRouteRef?.[routeid] ?? references?.routes?.[routeid]}
        <span
          class="rounded p-1 text-xs"
          style:color={"#" + routeRef?.style?.icon?.textColor}
          style:background-color={"#" + routeRef?.style?.color}
          >{routeRef?.shortName || ""}
        </span>
      {/each}

      {#if stop.direction}
        <span class="h-3 w-3 align-middle"
          ><span
            class="material-symbols-outlined dark:text-slate-50"
            style="transform: rotate({stop.direction + 'deg'});"
            >arrow_upward</span
          ></span
        >
      {/if}
    </div>
    <!-- <div class="text-xs text-gray-500">{stop.id}</div> -->
  </div>
  <div class="flex w-8 flex-col self-center p-1">
    <button on:click={() => toggleStop(stop)}>
      <span
        class="material-symbols-outlined dark:text-slate-100"
        style:font-variation-settings={saved ? "'FILL' 1" : ""}>favorite</span
      >
    </button>
  </div>
</div>
