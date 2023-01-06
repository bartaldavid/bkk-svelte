<script lang="ts">
  import type { components, operations } from "../data/bkk-openapi";
  import { savedStops, editMode } from "../data/stores";
  import MdFavoriteBorder from "svelte-icons/md/MdFavoriteBorder.svelte";
  import MdArrowBack from 'svelte-icons/md/MdArrowBack.svelte'
    import { stringify } from "uuid";

  const stopsForLocationUrl =
    "https://futar.bkk.hu/api/query/v1/ws/otp/api/where/stops-for-location.json?";

  let loading = false;
  let references: components["schemas"]["TransitReferences"];
  let listOfNearbyStops: components["schemas"]["TransitStop"][] = [];
  let accuracy: string;
  let searchQuery: string = "";
  let stopsForLocationParams: operations["getStopsForLocation"]["parameters"]["query"] =
    { query: "", lon: 47.452734, lat: 19.18329 };

  function getStops() {
    loading = true;
    stopsForLocationParams = { ...stopsForLocationParams, query: searchQuery };
    setCurrentLoc();
    fetch(
      // TODO find a better solution to this type issue
      stopsForLocationUrl +
        new URLSearchParams(stopsForLocationParams as any).toString()
    )
      .then((response) => response.json())
      .then((d: components["schemas"]["StopsForLocationResponse"]) => {
        if (d.code !== 200) {
          throw new Error(d.status);
        }
        return d.data;
      })
      .then((tripData) => {
        references = tripData?.references!;
        listOfNearbyStops = tripData?.list!;
        console.log(listOfNearbyStops);
        console.log(references);
      })
      .catch((err) => console.log(err))
      .finally(() => (loading = false));
  }

  const setCurrentLoc = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        stopsForLocationParams = {
          ...stopsForLocationParams,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        accuracy = pos.coords.accuracy.toFixed(0);
      },
      (error) => (accuracy = error.message)
    );
  };

  function saveStop(stopName: string, stopId: string, type: string, colors: string[]) {
    savedStops.update((prev) => [...prev, { label: stopName, id: [stopId], type: type, colors: colors }]);
  }
</script>

<div class="flex flex-col w-full md:w-72 mt-4">
  <div class="flex flex-row bg-slate-200 p-2 rounded">
    <button on:click={() => {$editMode = false}} class="w-6 pr-1"><MdArrowBack /></button>
    <input
      type="text"
      placeholder="Search for stops"
      bind:value={searchQuery}
      on:keydown={(e) => e.key === "Enter" && getStops()}
      class="bg-slate-200 outline-none flex-1"
    />
    <button on:click={getStops}>{loading ? "Loading..." : "Search"}</button
    >
  </div>
  <!-- <button on:click={setCurrentLoc}>Set loc as target</button> -->

  <div class="flex flex-col gap-1">
    {#each listOfNearbyStops as nearbyStop}
      {#if nearbyStop.locationType == 0}
        <div class="flex flex-row border rounded p-1">
          <div class="flex-1">
            <div class="mb-1">{nearbyStop.name}</div>
            <div class="flex flex-row flex-wrap gap-1">
              {#each nearbyStop.routeIds as routeid}
                <span
                  class="p-1 rounded text-xs"
                  style:color={"#" +
                    references.routes[routeid].style.icon.textColor}
                  style:background-color={"#" +
                    references.routes[routeid].style.color}
                  >{references.routes[routeid].shortName}
                </span>
              {/each}

              {nearbyStop.direction}
            </div>
            <!-- <div class="text-xs text-gray-500">{nearbyStop.id}</div> -->
          </div>
          <div class="flex flex-col w-8 self-center p-1">
            <button on:click={() => saveStop(nearbyStop.name, nearbyStop.id, references.stops[nearbyStop.id].type, references.stops[nearbyStop.id].style.colors)}>
              <!-- TODO hover state -->
              <MdFavoriteBorder />
            </button>
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>
