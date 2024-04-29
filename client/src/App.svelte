<!-- src/App.svelte -->

<script lang="ts">
  import { SendHorizontal } from "lucide-svelte";
  import { onMount } from "svelte";
  import io from "socket.io-client";
  let divElement: any;
  let socket: SocketIOClient.Socket;
  let messages: any = [];
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
    socket.on("connect", () => {
      console.log("Connected to server");
      connected = true;

      // Wysyłanie nazwy użytkownika do serwera po nawiązaniu połączenia
      if (username) {
        socket.emit("setUsername", username);
      }
    });
    socket.on("messageHistory", (history) => {
      messages = history;
    });
    socket.on("chat message", (msg: any) => {
      messages = [...messages, msg];
    });
  }

  function sendMessage() {
    socket.emit("chat message", message);
    message = "";
    divElement.scrollTop = divElement.scrollHeight;
  }
</script>

<div class="flex justify-center">
  <h1 class="text-7xl mt-16 mb-8 font-semibold">Kreat-Chat</h1>
</div>
{#if connected}
  <main
    bind:this={divElement}
    class="container mx-auto px-4 py-8 rounded-2xl bg-primary-content overflow-y-auto h-96 scroll-smooth"
  >
    <ul class=" text-left">
      {#each messages as msg}
        <li class=" p-2 rounded-md flex items-center gap-2 break-all">
          <div>
            <img
              src="{msg.avatar}.png"
              alt="avatar"
              class="w-7 h-7 rounded-full avatar"
            />
          </div>
          {#if msg.type == 2}
            <strong>{msg.name}</strong>{msg.message}
          {/if}
          {#if msg.type == 0}
            <strong class="text-green-500">{msg.name}</strong>
          {/if}
          {#if msg.type == 1}
            <strong class="text-red-500">{msg.name}</strong>
          {/if}
        </li>
      {/each}
    </ul>
  </main>
  <div class="flex justify-center gap-2 m-5">
    <input
      type="text"
      class="input px-4 w-3/4 py-2 border-none focus:outline-none focus:ring-base-content focus:border-base-content bg-primary-content rounded-3xl"
      bind:value={message}
      placeholder="Wiadomość"
      maxlength="300"
      on:keyup|preventDefault={(e) => e.key === "Enter" && sendMessage()}
    />
    <button
      class="btn rounded-full bg-secondary"
      on:click|preventDefault={sendMessage}
      ><SendHorizontal color="#ffffff" /></button
    >
  </div>
{/if}
{#if !connected}
  <div class="flex justify-center">
    <div>
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">Twoja nazwa</span>
        </div>
        <input
          type="text"
          bind:value={username}
          placeholder="Wprowadź nazwę"
          class="input input-bordered w-full max-w-xs"
        />
        <button
          on:click={connectToSocket}
          disabled={connected}
          class="btn text-lg m-5">Połącz</button
        >
      </label>
    </div>
  </div>
{/if}

<style>
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
      "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
      "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
      monospace;
  }
</style>
