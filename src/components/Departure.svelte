<script lang="ts">
  import { tripDataUrl } from "../data/api-links";
  import type { components, operations } from "../data/bkk-openapi";
  import { fetchData } from "../hooks/fetch";
  import Countdown from "./Countdown.svelte";
  import TripDetails from "./TripDetails.svelte";
  import { epochToDate, displayDate } from "../hooks/dateMagic";
  import { expandedTripId } from "../data/stores";
  import { onMount } from "svelte";

  export let departure: components["schemas"]["TransitScheduleStopTime"] = {};
  export let references: components["schemas"]["OTPTransitReferences"] = {};

  let tripParams: operations["getTripDetails"]["parameters"]["query"] = {
    tripId: departure.tripId,
    includeReferences: ["stops"],
    version: "4",
  };

  type tripDetailResponse = {
    loading: boolean;
    error: string;
    data: components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"];
  };

  let tripRef: components["schemas"]["TransitReferences"];
  let tripData: components["schemas"]["TransitTripDetailsOTP"];

  const routeId = references?.trips?.[departure?.tripId!]?.routeId;
  const routeData = references?.routes?.[routeId!];

  const predictedDepartureDate = epochToDate(departure.predictedDepartureTime);
  const departureDate = epochToDate(departure.departureTime);

  // FIXME not a valid fallback
  const countDownToDate = predictedDepartureDate ?? departureDate ?? new Date();

  const delayInMinutes =
    departure.predictedDepartureTime && departure.departureTime
      ? (departure?.predictedDepartureTime - departure?.departureTime) / 60
      : 0;

  onMount(async () => {
    if ($expandedTripId === departure.tripId) {
      let response: tripDetailResponse = await fetchData<
        components["schemas"]["TripDetailsOTPMethodResponse"]
      >(tripDataUrl, tripParams!);
      tripData = response.data.entry!;
      tripRef = response.data.references!;
    }
  });

  // TODO migrating this to Svelte Query should solve refresh glitch
  async function toggleDetails() {
    if ($expandedTripId !== departure.tripId) {
      let response: tripDetailResponse = await fetchData<
        components["schemas"]["TripDetailsOTPMethodResponse"]
      >(tripDataUrl, tripParams!);
      tripData = response.data.entry!;
      tripRef = response.data.references!;
      // console.log(tripData);
      // console.log(tripRef);
      $expandedTripId = departure.tripId ?? "";
    } else {
      $expandedTripId = "";
    }
  }
</script>

<div
  class="flex w-full flex-col  rounded bg-slate-100 p-4 hover:cursor-pointer dark:bg-slate-700 dark:text-slate-50"
  on:click={toggleDetails}
  on:keypress={() => {}}
>
  <div class="flex justify-between gap-6">
    <div>
      <span>{displayDate(departureDate)}</span>
      {#if departure.predictedDepartureTime}
        <span
          class={delayInMinutes > 1
            ? "text-red-500 dark:text-red-400"
            : "green"}
        >
          > {displayDate(predictedDepartureDate)}
        </span>
        {#if delayInMinutes > 0.5}
          <span
            class="text-xs {delayInMinutes > 1
              ? 'text-red-500 dark:text-red-400'
              : 'green'}">(+{delayInMinutes.toFixed(1)})</span
          >
        {/if}
      {/if}

      <div class="my-1 text-sm">
        <span
          style:color={"#" + routeData?.style?.icon?.textColor}
          style:background-color={"#" + routeData?.style?.color}
          class="rounded p-1"
        >
          {routeData?.shortName}
        </span>
        <span class="text-sm">{departure.stopHeadsign}</span>
      </div>
      {#if departure.alertIds}
        {#each departure.alertIds as alertId}
          <div class="mt-2 text-xs text-red-500 dark:text-red-400">
            {references?.alerts?.[alertId]?.header?.someTranslation}
          </div>
        {/each}
      {/if}
    </div>
    <div class="flex flex-col justify-center text-center">
      <Countdown {countDownToDate} />
      <div class="text-xs text-slate-700 dark:text-slate-100">perc múlva</div>
    </div>
  </div>

  {#if $expandedTripId === departure.tripId}
    <TripDetails {tripRef} {tripData} />
  {/if}
</div>

<style>
  .green {
    @apply text-green-500;
  }
</style>
