<script lang="ts">
  import type { components } from "../data/bkk-openapi";
  import { savedStops, savedRouteRef } from "../data/stores";

  import { MdFavoriteBorder, MdFavorite, MdArrowUpward } from "svelte-icons/md";
  import { prevent_default } from "svelte/internal";
  export let references: components["schemas"]["TransitReferences"] = {};
  export let stop: components["schemas"]["TransitStop"] = {};
  $: saved = $savedStops.some((savedStop) => savedStop.id == stop.id);

  // TODO also save references for routes so that route icons can be displayed
  function toggleStop(stop: components["schemas"]["TransitStop"]) {
    if (!saved) {
      savedStops.update((prev) => [...prev, stop]);
      let routeRefForStop: {
        [key: string]: components["schemas"]["TransitRoute"] | undefined;
      } = {};
      stop.routeIds.forEach((routeId) => {
        routeRefForStop[routeId] = references.routes[routeId];
      });
      savedRouteRef.update((prev) => {
        return { ...prev, ...routeRefForStop };
      });
    } else {
      savedStops.update((prev) => prev.filter((e) => e.id !== stop.id));
    }
  }
</script>

<div class="flex flex-row rounded border p-1">
  <div class="flex-1">
    <div class="flex-row">
      <div class="mb-1">{stop.name}</div>
    </div>
    <div class="flex flex-row flex-wrap gap-1">
      <!-- TODO it would be nicer if savedrouteref would be passed down as references.routes here -->
      {#each stop?.routeIds || [] as routeid}
        {#if $savedRouteRef[routeid]}
          <span
            class="rounded p-1 text-xs"
            style:color={"#" + $savedRouteRef[routeid].style.icon.textColor}
            style:background-color={"#" + $savedRouteRef[routeid].style.color}
            >{$savedRouteRef?.[routeid]?.shortName || ""}
          </span>
        {:else if references.routes[routeid]}
          <span
            class="rounded p-1 text-xs"
            style:color={"#" + references.routes[routeid].style.icon.textColor}
            style:background-color={"#" +
              references.routes[routeid].style.color}
            >{references.routes[routeid].shortName}
          </span>
        {/if}
      {/each}

      {#if stop.direction}
        <span
          style="transform: rotate({stop.direction + 'deg'});"
          class="h-4 w-4 self-center"><MdArrowUpward /></span
        >
      {/if}
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
