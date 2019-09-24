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
  <title>Example — Basic</title>
  <meta name="description" content="Svelte-popover — Example — Basic" />
  <meta name="keywords" content="svelte-popover,popover,basic" />
  <meta name="author" content="Vahe Araqelyan" />
</svelte:head>

<h1>Basic</h1>

<a href="examples/eventPropagation">→ preventDefault/stopPropagation</a>

<p>Simply just click on the button</p>

<div class="link">
  <a target="_blank" href={`${openInSource}/basic.svelte`}>View this example's source</a>
  <a target="_blank" href="https://svelte.dev/repl/d6aab80cd0b24f1bb9d934a2eb9a79a0?version=3.12.1">Open in repl</a>
</div>

<Popover arrowColor="#fff">
  <button slot="target">Target</button>
  <div slot="content" class="content">Content</div>
</Popover>

<script>
  import { openInSource } from './github.js';
  import Popover from 'svelte-popover';
</script>
