<script lang="ts">
  import type { components } from "../data/bkk-openapi";
  import { epochToDate, displayDate } from "../hooks/dateMagic";

  export let tripRef: components["schemas"]["TransitReferences"];
  export let tripData: components["schemas"]["TransitTripDetailsOTP"];
</script>

<div class="mt-2 flex flex-col text-sm">
  {#each tripData.stopTimes as stopTime}
    <div
      class="flex flex-row {epochToDate(
        stopTime.predictedDepartureTime ??
          stopTime.departureTime ??
          stopTime.predictedArrivalTime ??
          stopTime.arrivalTime
      ) < new Date()
        ? 'text-gray-500'
        : ''}"
    >
      <span class="pr-2">
        {displayDate(
          epochToDate(
            stopTime.predictedDepartureTime ??
              stopTime.departureTime ??
              stopTime.predictedArrivalTime ??
              stopTime.arrivalTime
          )
        )}
      </span>
      <span>
        {tripRef.stops[stopTime.stopId].name}
      </span>
    </div>
  {/each}
</div>
