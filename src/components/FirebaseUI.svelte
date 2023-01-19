<script lang="ts">
  import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    type User,
  } from "firebase/auth";
  import { collection, addDoc } from "firebase/firestore";
  import { auth } from "../util/firebaseSetup";
  import { serverTimestamp } from "firebase/firestore";
  import { savedStops, user, userData } from "../data/stores";

  const provider = new GoogleAuthProvider();
  let isLoggedIn: boolean;
  let userFullname: string;
  let inputtedData: string;

  auth.onAuthStateChanged((user) => {
    if (user) {
      isLoggedIn = true;
      userFullname = user?.displayName ?? "Anonymus";
    } else {
      isLoggedIn = false;
      userFullname = "";
    }
  });

  async function saveDataToServer() {
    try {
      const { getFirestore, writeBatch, doc } = await import(
        "firebase/firestore"
      );
      const firestore = getFirestore();
      const stopsRef = collection(firestore, `userdata/${$user?.uid}/stops`);

      const batch = writeBatch(firestore);

      $savedStops.forEach((stop) => {
        const docRef = doc(stopsRef, stop.id);
        batch.set(docRef, stop);
      });
      await batch.commit();
      console.log("Documents written successfully");
    } catch (e) {
      console.error("Error occured", e);
    }
  }
</script>

<div class="self-center text-white">
  {#if isLoggedIn}
    <div>Hi, {userFullname}</div>
    <button on:click={() => signOut(auth)}>Sign out</button>
    <button on:click={saveDataToServer}>Save stops to the server!</button>
    <button on:click={() => console.log($userData)}
      >Log stops on the server!</button
    >
  {:else}
    <button on:click={() => signInWithPopup(auth, provider)}
      >Sign in with google</button
    >
  {/if}
</div>
