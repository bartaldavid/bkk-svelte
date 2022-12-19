<script lang="ts">
  import { onMount } from "svelte";
  import type { components } from "../data/bkk-openapi";

  export let departure: components["schemas"]["TransitScheduleStopTime"] = {};
  export let references: components["schemas"]["OTPTransitReferences"] = {};

  const routeId = references.trips[departure.tripId].routeId;
  const routeData = references.routes[routeId];

  function displayTime(date: number): string {
    if (date !== undefined) {
      return new Date(date).toLocaleTimeString("hu", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else return null;
  }
</script>

<div class="departure">
  <span>{displayTime(departure.departureTime * 1000)}</span>
  {#if departure.predictedDepartureTime}
    <span style:color="red">
      {" -> "}{displayTime(departure.predictedDepartureTime * 1000)}
    </span>
  {/if}

  <div>
    <span
      style:color={"#" + routeData.style.icon.textColor}
      style:background-color={"#" + routeData.style.color}
      class="route-icon"
    >
      {routeData.shortName}
    </span>
    <span>{departure.stopHeadsign}</span>
  </div>
  {#if departure.alertIds}
    {#each departure.alertIds as alertId}
      <div class="alert">
        {references.alerts[alertId].header.someTranslation}
      </div>
    {/each}
  {/if}
</div>

<style>
  .departure {
    border: 1px solid white;
    border-radius: 0.5rem;
    width: 100%;
    padding: 1rem;
    text-align: start;
  }
  @media (min-width: 576px) {
    .departure {
      width: 20rem;
    }
  }
  .route-icon {
    padding: 0.2rem;
    border-radius: 0.2rem;
  }
  .alert {
    font-size: smaller;
    margin-top: 0.5rem;
  }
</style>
