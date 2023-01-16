import { writable } from "svelte/store";
import type { components } from "./bkk-openapi";

const STOPS_LSKEY = "bkk.stops";

export type savedStop = components["schemas"]["TransitStop"] & {
  routeRef?: {
    [key: string]: components["schemas"]["TransitRoute"] | undefined;
  };
};

const storedStops: savedStop[] = JSON.parse(
  localStorage.getItem(STOPS_LSKEY) ?? "{}"
);
export const savedStops = writable<savedStop[]>(storedStops ?? []);

savedStops.subscribe((value) =>
  localStorage.setItem(STOPS_LSKEY, JSON.stringify(value))
);

export const editMode = writable(false);
export const expandedTripId = writable("");
export const selectedStopID = writable("");
