import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  CollectionReference,
  query,
  type DocumentData,
} from "firebase/firestore";
import { get, writable } from "svelte/store";
import { auth, db } from "../util/firebaseSetup";
import type { components } from "./bkk-openapi";

export type savedStop = components["schemas"]["TransitStop"] & {
  routeRef?: {
    [key: string]: components["schemas"]["TransitRoute"] | undefined;
  };
};

// const STOPS_LSKEY = "bkk.stops";
// const storedStops: savedStop[] = JSON.parse(
//   localStorage.getItem(STOPS_LSKEY) ?? "{}"
// );
export const savedStops = writable<savedStop[]>([]);

export const editMode = writable(false);

export const user = writable<User | null>(null); // FIXME can't assign null
export const stopsRef = writable<CollectionReference<DocumentData>>();
// it would be much more difficult to correctly type this
let unsubData: any;

savedStops.subscribe(async (stops) => {
  if (get(user)?.uid) {
    try {
      const { writeBatch, doc } = await import("firebase/firestore");
      const batch = writeBatch(db);

      stops.forEach((stop) => {
        const docRef = doc(get(stopsRef), stop.id);
        batch.set(docRef, stop);
      });
      await batch.commit();
      console.log("Documents written successfully");
    } catch (error) {
      console.error("Error occured", error);
    }
  } else {
    // will only save to localstorage if user isn't logged in
    // localStorage.setItem(STOPS_LSKEY, JSON.stringify(stops));
  }
});

onAuthStateChanged(auth, async (currentUser) => {
  user.set(currentUser);
  if (currentUser) {
    const { onSnapshot } = await import("firebase/firestore");
    stopsRef.set(collection(db, `userdata/${currentUser.uid}/stops`));

    const q = query(get(stopsRef));
    unsubData = onSnapshot(q, (snap) => {
      const stops: savedStop[] = [];
      snap.forEach((doc) => stops.push(doc.data()));
      savedStops.set(stops);
    });
  } else {
    unsubData && unsubData();
  }
});
