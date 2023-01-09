<script lang="ts">
  import { fetchData } from "../hooks/fetch";
  import { stopDataUrl } from "../data/api-links";
  import type { operations } from "../data/bkk-openapi";

  let stopParams: operations["getArrivalsAndDeparturesForStop"]["parameters"]["query"] =
    {
      stopId: ["BKK_F02730"],
      onlyDepartures: true,
      limit: 10,
      minutesBefore: 0,
      minutesAfter: 90,
    };

  async function fetch() {
    let { loading, error, data } = await fetchData(
      stopDataUrl,
      new URLSearchParams(stopParams as any)
    );
    console.log([loading, error, data]);
  }
</script>

<button on:click={fetch}>Log data to console</button>
