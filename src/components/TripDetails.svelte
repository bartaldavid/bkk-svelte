<script lang="ts">
  import type { components } from "../data/bkk-openapi";
  import { epochToDate, displayDate } from "../hooks/dateMagic";

  export let tripRef: components["schemas"]["TransitReferences"];
  export let tripData: components["schemas"]["TransitTripDetailsOTP"];
</script>

<div class="mt-2 flex flex-col text-sm">
  {#if tripData?.stopTimes?.length > 0}
    {#each tripData.stopTimes as stopTime}
      {@const displayedTime =
        stopTime.predictedDepartureTime ??
        stopTime.predictedArrivalTime ??
        stopTime.departureTime ??
        stopTime.arrivalTime}
      <div
        class="flex flex-row {epochToDate(displayedTime) < new Date()
          ? 'text-gray-500'
          : ''}"
      >
        <span class="pr-2">
          {displayDate(epochToDate(displayedTime))}
        </span>
        <span>
          {tripRef.stops[stopTime.stopId].name}
        </span>
      </div>
    {/each}
  {/if}
</div>
