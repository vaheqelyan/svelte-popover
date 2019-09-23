<style>
  .content {
    padding: 10px;
    background: #fff;
  }
  .link {
    display: flex;
    padding-bottom: 20px;
  }
  .link a {
    margin-left: 10px;
  }
</style>

<svelte:head>
  <title>Example — onOpen/onClose</title>
  <meta name="description" content="Svelte-popover — Example — onOpen/onClose" />
  <meta name="keywords" content="svelte-popover,onOpen,onClose,svelte,popover" />
  <meta name="author" content="Vahe Araqelyan" />
</svelte:head>

<h1>onOpen/onClose</h1>

<p>
  <a href="examples/hover">← Arrow</a>
</p>

<p>
  <code>on:open</code>
  is dispatched/called when the content is mounted,
  <code>on:close</code>
  is dispatched/called after the content is unmounted from the dom
</p>

<div class="link">
  <a target="_blank" href={`${openInSource}/basic.svelte`}>View this example's source</a>
  <a target="_blank" href="https://svelte.dev/repl/d1ce1a3c34804fa59622c187d1cdea58?version=3.12.1">Open in repl</a>
</div>

<Popover on:open={() => alert('open')} on:close={() => alert('close')}>
  <button slot="target">Click</button>
  <div slot="content" class="content">Hello, world!</div>
</Popover>

<script>
  import { openInSource } from './github.js';
  import Popover from 'svelte-popover';
</script>
