<script lang="ts">
  import type { components } from "../data/bkk-openapi";
  import { epochToDate, displayDate } from "../hooks/dateMagic";

  export let tripRef: components["schemas"]["TransitReferences"];
  export let tripData: components["schemas"]["TransitTripDetailsOTP"];
</script>

<div class="mt-2 flex flex-col text-sm">
  {#if tripData?.stopTimes?.length}
    {#each tripData.stopTimes as stopTime}
      {@const estimatedDepArr = epochToDate(
        stopTime.predictedDepartureTime ?? stopTime.predictedArrivalTime
      )}
      <div
        class="flex flex-row"
        class:text-gray-500={estimatedDepArr && estimatedDepArr < new Date()}
      >
        <span class="pr-2">
          {displayDate(
            epochToDate(
              stopTime.predictedDepartureTime ??
                stopTime.predictedArrivalTime ??
                stopTime.departureTime ??
                stopTime.arrivalTime
            )
          )}
        </span>
        <span>
          {stopTime.stopId ? tripRef?.stops?.[stopTime?.stopId]?.name : ""}
        </span>
      </div>
    {/each}
  {/if}
</div>
