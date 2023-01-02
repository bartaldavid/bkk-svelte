<script lang="ts">
  import type { components } from "../data/bkk-openapi";

  export let departure: components["schemas"]["TransitScheduleStopTime"] = {};
  export let references: components["schemas"]["OTPTransitReferences"] = {};

  const routeId = references?.trips?.[departure?.tripId].routeId;
  const routeData = references?.routes?.[routeId];

  const predictedDepartureDate = epochToDate(departure.predictedDepartureTime);
  const departureDate = epochToDate(departure.departureTime);

  let [hoursC, minutesC, secondsC] = countdown(
    predictedDepartureDate || departureDate
  );

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

  function countdown(date: Date): number[] {
    const now = new Date().getTime();
    const distance = date.valueOf() - now;

    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return [hours, minutes, seconds];
  }

  setInterval(() => {
    [hoursC, minutesC, secondsC] = countdown(
      predictedDepartureDate || departureDate
    );
  }, 1000);

  const displayCountdown = ([h, m, s]: number[]): string => {
    console.log([h, m, s]);
    if (h > 0) return `${h}h ${m}`;
    if (m > 10) return m.toString();
    return `${m}:${s}`;
  };
</script>

<div
  class="w-full p-4 {hoursC > 0 || minutesC > 1
    ? ''
    : 'text-slate-500'}  bg-slate-100 flex justify-between gap-6"
>
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
    <div>{displayCountdown([hoursC, minutesC, secondsC])}</div>
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
