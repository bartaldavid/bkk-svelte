import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  CollectionReference,
  query,
  type DocumentData,
} from "firebase/firestore";
import { get, writable } from "svelte/store";
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

export const editMode = writable(false);

// FIXME this could also be a state saved elsewhere
export const expandedTripId = writable("");
export const selectedStopID = writable("");

export const user = writable<User | null>(null); // FIXME can't assign null
export const userData = writable<savedStop[]>();
export const stopsRef = writable<CollectionReference<DocumentData>>();
// it would be much more difficult to correctly type this
let unsubData: any;

// TODO deleted stops aren't deleted on the server
savedStops.subscribe(async (stops) => {
  localStorage.setItem(STOPS_LSKEY, JSON.stringify(stops));

  if (get(user)) {
    try {
      const { getFirestore, writeBatch, doc } = await import(
        "firebase/firestore"
      );
      const firestore = getFirestore();
      stopsRef.set(collection(firestore, `userdata/${get(user)?.uid}/stops`));

      const batch = writeBatch(firestore);

      stops.forEach((stop) => {
        const docRef = doc(get(stopsRef), stop.id);
        batch.set(docRef, stop);
      });
      await batch.commit();
      console.log("Documents written successfully");
    } catch (error) {
      console.error("Error occured", error);
    }
  }
});

onAuthStateChanged(auth, async (currentUser) => {
  user.set(currentUser);
  if (currentUser) {
    const { getFirestore, onSnapshot } = await import("firebase/firestore");
    const firestore = getFirestore();
    const stopsRef = collection(firestore, `userdata/${currentUser.uid}/stops`);

    const q = query(stopsRef);
    unsubData = onSnapshot(q, (snap) => {
      const stops: savedStop[] = [];
      snap.forEach((doc) => stops.push(doc.data()));
      userData.set(stops);
      savedStops.set(stops);
    });
  } else {
    unsubData && unsubData();
    userData.set([]);
  }
});
