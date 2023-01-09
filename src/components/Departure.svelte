<script lang="ts">
  import { tripDataUrl } from "../data/api-links";
  import type { components, operations } from "../data/bkk-openapi";
  import { fetchData } from "../hooks/fetch";
  import Countdown from "./Countdown.svelte";
  import TripDetails from "./TripDetails.svelte";
  import { epochToDate, displayDate } from "../hooks/dateMagic";

  export let departure: components["schemas"]["TransitScheduleStopTime"] = {};
  export let references: components["schemas"]["OTPTransitReferences"] = {};
  let expanded = false;
  let tripParams: operations["getTripDetails"]["parameters"]["query"] = {
    tripId: departure.tripId,
    includeReferences: ["stops"],
  };

  type tripDetailResponse = {
    loading: boolean;
    error: string;
    data: components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"];
  };

  let tripRef: components["schemas"]["TransitReferences"];
  let tripData: components["schemas"]["TransitTripDetailsOTP"];

  const routeId = references?.trips?.[departure?.tripId].routeId;
  const routeData = references?.routes?.[routeId];

  const predictedDepartureDate = epochToDate(departure.predictedDepartureTime);
  const departureDate = epochToDate(departure.departureTime);

  const countDownToDate = predictedDepartureDate ?? departureDate;

  const delayInMinutes =
    (departure?.predictedDepartureTime - departure?.departureTime) / 60;

  async function toggleDetails() {
    if (expanded === false) {
      let response: tripDetailResponse = await fetchData<
        components["schemas"]["TripDetailsOTPMethodResponse"]
      >(tripDataUrl, tripParams);
      tripData = response.data.entry;
      tripRef = response.data.references;
      console.log(tripData);
      console.log(tripRef);
    }
    expanded = !expanded;
  }
</script>

<div
  class="flex w-full flex-col  bg-slate-100 p-4 hover:cursor-pointer"
  on:click={toggleDetails}
  on:keypress={() => {}}
>
  <div class="flex justify-between gap-6">
    <div>
      <span>{displayDate(departureDate)}</span>
      {#if departure.predictedDepartureTime}
        <span class={delayInMinutes > 1 ? "red" : "green"}>
          > {displayDate(predictedDepartureDate)}
        </span>
        {#if delayInMinutes > 0.5}
          <span class="text-xs {delayInMinutes > 1 ? 'red' : 'green'}"
            >(+{delayInMinutes.toFixed(1)})</span
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
          <div class="mt-2 text-xs text-red-500">
            {references?.alerts?.[alertId]?.header.someTranslation}
          </div>
        {/each}
      {/if}
    </div>
    <div class="flex flex-col justify-center text-center">
      <Countdown {countDownToDate} />
      <div class="text-xs text-slate-700">perc múlva</div>
    </div>
  </div>

  {#if expanded}
    <TripDetails {tripRef} {tripData} />
  {/if}
</div>

<style>
  .red {
    @apply text-red-500;
  }
  .green {
    @apply text-green-500;
  }
</style>
