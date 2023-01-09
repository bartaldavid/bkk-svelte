<script lang="ts">
  import type { components } from "../data/bkk-openapi";
  import Countdown from "./Countdown.svelte";

  export let departure: components["schemas"]["TransitScheduleStopTime"] = {};
  export let references: components["schemas"]["OTPTransitReferences"] = {};

  const routeId = references?.trips?.[departure?.tripId].routeId;
  const routeData = references?.routes?.[routeId];

  const predictedDepartureDate = epochToDate(departure.predictedDepartureTime);
  const departureDate = epochToDate(departure.departureTime);

  const countDownToDate = predictedDepartureDate ?? departureDate;

  const delayInMinutes =
    (departure?.predictedDepartureTime - departure?.departureTime) / 60;

  function epochToDate(epochDate: number): Date | null {
    if (epochDate === undefined) return null;
    let date = new Date(0);
    date.setUTCSeconds(epochDate);
    return date;
  }

  function displayDate(date: Date): string {
    return date.toLocaleTimeString("hu", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<div class="w-full p-4 bg-slate-100 flex justify-between gap-6">
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

    <div class="text-sm my-1">
      <span
        style:color={"#" + routeData?.style?.icon?.textColor}
        style:background-color={"#" + routeData?.style?.color}
        class="p-1 rounded"
      >
        {routeData?.shortName}
      </span>
      <span class="text-sm">{departure.stopHeadsign}</span>
    </div>
    {#if departure.alertIds}
      {#each departure.alertIds as alertId}
        <div class="text-xs mt-2 text-red-500">
          {references?.alerts?.[alertId]?.header.someTranslation}
        </div>
      {/each}
    {/if}
  </div>
  <div class="justify-center text-center flex flex-col">
    <Countdown {countDownToDate} />
    <div class="text-xs text-slate-700">perc múlva</div>
  </div>
</div>

<style>
  .red {
    @apply text-red-500;
  }
  .green {
    @apply text-green-500;
  }
</style>
