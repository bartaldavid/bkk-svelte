import { writable } from "svelte/store";
import type { components } from "./bkk-openapi";
import defaultStops from "./defaultStops";

const STOPS_LSKEY = "bkk.stops";
const ROUTE_REF_LSKEY = "bkk.reference";

const storedStops = JSON.parse(localStorage.getItem(STOPS_LSKEY) ?? "{}");
export const savedStops = writable<components["schemas"]["TransitStop"][]>(
  storedStops || defaultStops
);

savedStops.subscribe((value) =>
  localStorage.setItem(STOPS_LSKEY, JSON.stringify(value))
);

const storedRouteRef = JSON.parse(
  localStorage.getItem(ROUTE_REF_LSKEY) ?? "{}"
);
export const savedRouteRef = writable<{
  [key: string]: components["schemas"]["TransitRoute"] | undefined;
}>(storedRouteRef);

savedRouteRef.subscribe((value) =>
  localStorage.setItem(ROUTE_REF_LSKEY, JSON.stringify(value))
);

export const editMode = writable(false);
export const expandedTripId = writable("");
export const selectedStopID = writable("");
