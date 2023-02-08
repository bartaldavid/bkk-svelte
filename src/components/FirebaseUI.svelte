<script lang="ts">
  import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
  import { auth } from "../util/firebaseSetup";

  const provider = new GoogleAuthProvider();
  let isLoggedIn: boolean;
  let userFullname: string;

  auth.onAuthStateChanged((user) => {
    if (user) {
      isLoggedIn = true;
      userFullname = user?.displayName ?? "Anonymus";
    } else {
      isLoggedIn = false;
      userFullname = "";
    }
  });
</script>

<div class="self-center text-white">
  {#if isLoggedIn}
    <div>Hi, {userFullname}</div>
    <button on:click={() => signOut(auth)}>Sign out</button>
  {:else}
    <button on:click={() => signInWithPopup(auth, provider)}
      >Sign in with google</button
    >
  {/if}
</div>
