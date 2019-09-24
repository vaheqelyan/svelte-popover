<style>
  .group {
    display: flex;
    flex-wrap: wrap;
  }
  :global(.popover + .popover) {
    margin: 0 10px !important;
  }

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
  <title>Example — Arrow</title>
  <meta name="description" content="Svelte-popover — Example — Arrow" />
  <meta name="keywords" content="svelte-popover,svelte,arrow" />
  <meta name="author" content="Vahe Araqelyan" />
</svelte:head>

<h1>Arrow</h1>

<a href="examples/onOpenClose">→ onOpen/onClose</a>

<p>
  <a href="examples/hover">← Hover</a>
</p>

<p>
  An arrow is just a symbol ◥. You can change the color of the arrow by setting the
  <code>arrowColor</code>
  property, and turn off arrow by setting false for the
  <code>arrow</code>
  property
</p>

<div class="link">
  <a target="_blank" href={`${openInSource}/basic.svelte`}>View this example's source</a>
  <a target="_blank" href="https://svelte.dev/repl/7ef90cae7c8746c2af4f4e5848c05d15?version=3.12.1">Open in repl</a>
</div>

<div class="group">
  <Popover arrowColor="red">
    <button slot="target">Red arrow</button>
    <div slot="content" class="content">Content</div>
  </Popover>

  <Popover arrowColor="#fff" arrow={false}>
    <button slot="target">No arrow</button>
    <div slot="content" class="content">Content</div>
  </Popover>
</div>

<script>
  import { openInSource } from './github.js';
  import Popover from 'svelte-popover';
</script>
