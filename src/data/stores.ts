import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, query, where } from "firebase/firestore";
import { writable } from "svelte/store";
import { auth } from "../util/firebaseSetup";
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

// FIXME this could also be a state saved elsewhere
export const expandedTripId = writable("");
export const selectedStopID = writable("");

export const user = writable<User | null>(null); // FIXME can't assign null
export const userData = writable<savedStop[]>(); // TODO type

// it would be much more difficult to correctly type this
let unsubData: any;

onAuthStateChanged(auth, async (currentUser) => {
  user.set(currentUser);
  if (currentUser) {
    const { getFirestore, onSnapshot } = await import("firebase/firestore");
    const firestore = getFirestore();
    const stopsRef = collection(firestore, "stops");

    const q = query(stopsRef, where("uid", "==", currentUser.uid));
    unsubData = onSnapshot(q, (snap) => {
      userData.set(snap.docs);
    });
  } else {
    unsubData && unsubData();
    userData.set([]);
  }
});
