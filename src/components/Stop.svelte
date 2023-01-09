<script lang="ts">
  import type { components } from "../data/bkk-openapi";
  import { savedStops } from "../data/stores";

  import { MdFavoriteBorder, MdFavorite } from "svelte-icons/md";
  export let references: components["schemas"]["TransitReferences"] = {};
  export let stop: components["schemas"]["TransitStop"] = {};
  $: saved = $savedStops.some((savedStop) => savedStop.id == stop.id);

  // TODO also save references for routes so that route icons can be displayed
  function toggleStop(stop: components["schemas"]["TransitStop"]) {
    if (!saved) {
      savedStops.update((prev) => [...prev, stop]);
    } else {
      savedStops.update((prev) => prev.filter((e) => e.id !== stop.id));
    }
  }
</script>

<div class="flex flex-row rounded border p-1">
  <div class="flex-1">
    <div class="mb-1">{stop.name}</div>
    <div class="flex flex-row flex-wrap gap-1">
      {#if references.routes}
        <!-- FIXME this should be working if the references are saved to a store -->
        {#each stop?.routeIds || [] as routeid}
          <span
            class="rounded p-1 text-xs"
            style:color={"#" + references.routes[routeid].style.icon.textColor}
            style:background-color={"#" +
              references.routes[routeid].style.color}
            >{references.routes[routeid].shortName}
          </span>
        {/each}
      {/if}

      {stop.direction}
    </div>
    <!-- <div class="text-xs text-gray-500">{stop.id}</div> -->
  </div>
  <div class="flex w-8 flex-col self-center p-1">
    <button on:click={() => toggleStop(stop)}>
      {#if saved}
        <MdFavorite />
      {:else}
        <MdFavoriteBorder />
      {/if}
    </button>
  </div>
</div>
