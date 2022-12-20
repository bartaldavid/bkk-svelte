<script lang="ts">
  import type { components } from "../data/bkk-openapi";

  export let departure: components["schemas"]["TransitScheduleStopTime"] = {};
  export let references: components["schemas"]["OTPTransitReferences"] = {};

  const routeId = references?.trips?.[departure?.tripId].routeId;
  const routeData = references?.routes?.[routeId];

  const delayInMinutes =
    (departure?.predictedDepartureTime - departure?.departureTime) / 60;

  function epochToDate(epochDate: number): Date {
    let date = new Date(0);
    date.setUTCSeconds(epochDate);
    return date;
  }

  function displayEpochTime(epochDate: number): string {
    let date = new Date(0);
    date.setUTCSeconds(epochDate);
    return date.toLocaleTimeString("hu", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const minutesToDep = Math.floor(
    (epochToDate(
      departure?.predictedDepartureTime ??
        departure?.departureTime ??
        // FIXME this is not really a valid fallback
        Date.now()
    ).valueOf() -
      Date.now()) /
      60000
  );
</script>

<div
  class="w-full p-4 {minutesToDep > 1
    ? ''
    : 'text-slate-500'}  bg-slate-100 flex justify-between gap-6"
>
  <div>
    <span>{displayEpochTime(departure?.departureTime)}</span>
    {#if departure.predictedDepartureTime}
      <span class={delayInMinutes > 1 ? "red" : "green"}>
        > {displayEpochTime(departure.predictedDepartureTime)}
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
    <div>{minutesToDep.toString()}</div>
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
