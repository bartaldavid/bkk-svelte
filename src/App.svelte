<script lang="ts">
  import { each } from "svelte/internal";
  import type { operations, components } from "./data/bkk-openapi";
  import SearchView from "./components/SearchView.svelte";
  import { savedStops, editMode, fetchError } from "./data/stores";
  import { fetchData } from "./util/fetch";
  import { stopDataUrl } from "./data/api-links";

  import FirebaseUi from "./components/FirebaseUI.svelte";
  import DeleteAllStopsBtn from "./components/DeleteAllStopsBtn.svelte";
  import StopsView from "./components/StopsView.svelte";
  import DeparturesList from "./components/DeparturesList.svelte";

  const defaultStopParams: operations["getArrivalsAndDeparturesForStop"]["parameters"]["query"] =
    {
      version: "4",
      onlyDepartures: true,
      limit: 10,
      minutesBefore: 0,
      minutesAfter: 90,
    };

  let departures: components["schemas"]["TransitScheduleStopTime"][] = [];
  let references: components["schemas"]["OTPTransitReferences"] = {};

  let loading = false;
  let error = "";
  let data: components["schemas"]["TransitEntryWithReferencesTransitArrivalsAndDepartures"] =
    {};
  let selectedStopId: string;

  async function getStopData(stopId: string): Promise<void> {
    loading = true;
    selectedStopId = stopId;
    const stopParams = { ...defaultStopParams, stopId: [stopId] };
    ({ loading, error, data } = await fetchData<
      components["schemas"]["ArrivalsAndDeparturesForStopOTPMethodResponse"]
    >(stopDataUrl, stopParams));
    $fetchError = error;
    // TODO throw error
    references = data.references!;
    departures = data?.entry?.stopTimes!;
  }
  setInterval(() => {
    if (departures?.length > 0 && selectedStopId && !$editMode) {
      getStopData(selectedStopId);
    }
  }, 20000);
</script>

<main class="flex h-screen flex-row flex-wrap justify-center gap-4">
  <!-- TODO separate components with component events -->

  {#if $editMode}
    <SearchView />
  {:else}
    <div
      class="mt-4 ml-1 mr-1 flex w-full flex-col {$savedStops.length === 0 &&
      departures.length === 0
        ? 'justify-center'
        : ''} gap-2 sm:w-72"
    >
      <FirebaseUi />

      <StopsView
        on:stopSelected={(event) => {
          // TODO type event
          getStopData(event.detail.id);
        }}
      />

      <div
        class="flex gap-2 rounded bg-slate-50 p-2 dark:bg-slate-800 {$savedStops.length ===
          0 && departures.length === 0
          ? 'w-52 self-center'
          : ''}"
      >
        <button
          class="button-outline bg-white dark:border-none dark:bg-slate-700 dark:text-white"
          on:click={() => {
            $editMode = true;
          }}
          ><span class="material-symbols-outlined align-bottom text-base">
            add
          </span><span> Add stop</span>
        </button>

        {#if $savedStops.length > 0}
          <DeleteAllStopsBtn />
        {/if}
      </div>
    </div>

    <!-- FIXME make this a better error display -->
    {#if $fetchError}
      <p>{$fetchError}</p>
    {/if}

    {#if departures.length > 0}
      <div
        class="flex h-screen w-full flex-col gap-2 pt-4 sm:w-72 sm:overflow-auto"
      >
        <div class="flex items-center gap-2">
          <button
            class="button-outline dark:text-slate-100"
            on:click={() => getStopData(selectedStopId)}
            ><span
              class="material-symbols-outlined pr-1 align-bottom text-base"
            >
              refresh
            </span>{loading ? "Loading..." : "Refresh"}
          </button>
          <button
            class="button-outline dark:text-slate-100"
            on:click={() => {
              departures = [];
              selectedStopId = "";
            }}>Clear</button
          >
        </div>

        <DeparturesList {departures} {references} />
      </div>
    {/if}
  {/if}
</main>

<style>
  .button-outline {
    @apply flex-1 rounded border p-2;
  }
</style>
