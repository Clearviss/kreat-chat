<!-- src/App.svelte -->

<script lang="ts">
  import { onMount } from "svelte";
  import io from "socket.io-client";

  let socket: SocketIOClient.Socket;
  let messages: string[] = [];
  let message: string = "";
  let id = "";
  let connected = false;
  let username = "";

  function connectToSocket() {
    // Nawiązywanie połączenia z serwerem Socket.io
    if (username == "") {
      return;
    }
    socket = io("http://localhost:3000");
    socket.on("messageHistory", (history) => {
      messages = history;
    });
    socket.on("chat message", (msg: string) => {
      messages = [...messages, msg];
    });
    socket.on("connect", () => {
      console.log("Connected to server");
      connected = true;

      // Wysyłanie nazwy użytkownika do serwera po nawiązaniu połączenia
      if (username) {
        socket.emit("setUsername", username);
      }
    });
  }

  function sendMessage() {
    socket.emit("chat message", message);
    message = "";
  }
</script>

<main class="container mx-auto px-4 py-8">
  <ul class="space-y-16 text-left">
    {#each messages as msg}
      <li class="bg-gray-100 p-4 rounded-md">{msg}</li>
    {/each}
  </ul>
  {#if connected}
    <input
      type="text"
      class="border border-gray-300 px-4 py-2 rounded-md"
      bind:value={message}
      on:keyup|preventDefault={(e) => e.key === "Enter" && sendMessage()}
    />
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded-md"
      on:click|preventDefault={sendMessage}>Send</button
    >
  {/if}
  {#if !connected}
    <input
      type="text"
      bind:value={username}
      placeholder="Enter your username"
    />
    <button on:click={connectToSocket} disabled={connected}>Connect</button>
  {/if}
</main>

<style>
  /* Your Tailwind CSS utility classes go here */
</style>
