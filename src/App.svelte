<script lang="ts">
  import { each } from "svelte/internal";
  import type { operations, components } from "./data/bkk-openapi";
  import Departure from "./lib/Departure.svelte";
  import defaultStops from "./data/defaultStops";
  const stopDataUrl =
    "https://futar.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json?";
  const stopsForLocationUrl =
    "https://futar.bkk.hu/api/query/v1/ws/otp/api/where/stops-for-location.json?";
  let stopParams: operations["getArrivalsAndDeparturesForStop"]["parameters"]["query"] =
    {
      stopId: ["BKK_F01004"],
      onlyDepartures: true,
      limit: 10,
      minutesBefore: 0,
      minutesAfter: 90,
    };

  let stopsForLocationParams: operations["getStopsForLocation"]["parameters"]["query"] =
    { query: "Pestszentlőrinc", lon: 47.452734, lat: 19.18329 };

  let departures: components["schemas"]["TransitScheduleStopTime"][] = [];
  let references: components["schemas"]["OTPTransitReferences"] = {};
  let listOfNearbyStops: components["schemas"]["TransitStop"][] = [];
  let accuracy: string;

  let loading = false;
  // TODO make this a getdata(url,params, type) fn
  function getData(): void {
    loading = true;
    fetch(
      // TODO find a better solution to this type issue
      stopDataUrl + new URLSearchParams(stopParams as any).toString()
    )
      .then((response) => response.json())
      .then(
        (
          d: components["schemas"]["ArrivalsAndDeparturesForStopOTPMethodResponse"]
        ) => {
          if (d.code !== 200) {
            throw new Error(d.status);
          }
          return d.data;
        }
      )
      .then((tripData) => {
        references = tripData?.references;
        departures = tripData?.entry?.stopTimes;
      })
      .catch((err) => console.log(err))
      .finally(() => (loading = false));
  }

  function getStops() {
    loading = true;
    fetch(
      // TODO find a better solution to this type issue
      stopsForLocationUrl +
        new URLSearchParams(stopsForLocationParams as any).toString()
    )
      .then((response) => response.json())
      .then((d: components["schemas"]["StopsForLocationResponse"]) => {
        if (d.code !== 200) {
          throw new Error(d.status);
        }
        return d.data;
      })
      .then((tripData) => {
        references = tripData?.references;
        listOfNearbyStops = tripData?.list;
        console.log(listOfNearbyStops);
      })
      .catch((err) => console.log(err))
      .finally(() => (loading = false));
  }

  function logData() {
    console.log(departures);
    console.log(departures.length);
    departures.forEach((departure) =>
      console.log(references.trips[departure.tripId].routeId)
    );
  }

  const setCurrentLoc = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        stopsForLocationParams = {
          ...stopsForLocationParams,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        accuracy = pos.coords.accuracy.toFixed(0);
      },
      (error) => (accuracy = error.message)
    );
  };
</script>

<main>
  <div class="stops-container">
    {#each defaultStops as stop}
      <button
        on:click={() => {
          stopParams = { ...stopParams, stopId: stop.id };
          getData();
        }}>{stop.label}</button
      >
    {/each}
    {#if loading}
      <p>Loading...</p>
    {/if}
    <button on:click={setCurrentLoc}>Get current location</button>
    <button on:click={getStops}>Log stops</button>
    {#if accuracy}
      <div>Accuracy: {accuracy}</div>
    {/if}
  </div>
  <!-- <button on:click={getData}>Refresh</button>
  <button on:click={logData}>Log data</button> -->
  <div class="departure-container">
    {#each departures as departure (departure.tripId + departure.departureTime)}
      <Departure {departure} {references} />
    {/each}
  </div>
</main>

<style>
  .departure-container {
    display: flex;
    flex-flow: column;
    gap: 1rem;
  }
  .stops-container {
    display: flex;
    flex-flow: column;
    gap: 0.5rem;
  }
  main {
    display: flex;
    flex-flow: row wrap;
    gap: 5rem;
    margin: auto;
  }
</style>
