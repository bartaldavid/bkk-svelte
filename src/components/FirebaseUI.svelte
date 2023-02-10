<script lang="ts">
  import {
    GoogleAuthProvider,
    signInAnonymously,
    signInWithPopup,
    signOut,
  } from "firebase/auth";
  import { user } from "../data/stores";
  import { auth } from "../util/firebaseSetup";

  const provider = new GoogleAuthProvider();
</script>

<div class="self-center text-white">
  {#if $user}
    <div>Hi, {$user.displayName ?? $user.uid}</div>
    <button on:click={() => signOut(auth)}>Sign out</button>
  {:else}
    <button on:click={() => signInWithPopup(auth, provider)}
      >Sign in with google</button
    >
    <!-- TODO make this automatic -->
    <button on:click={() => signInAnonymously(auth)}>Sign in anonymously</button
    >
  {/if}
</div>
