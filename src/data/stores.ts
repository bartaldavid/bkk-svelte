import { writable } from "svelte/store";
import defaultStops from "./defaultStops";

const LOCAL_STORAGE_KEY = "bkk.stops";

const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
export const savedStops = writable(stored || defaultStops);

savedStops.subscribe((value) =>
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value))
);

export const editMode = writable(false);
