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
  <title>Example — Basic</title>
  <meta name="description" content="Svelte-grid — Example — Basic" />
  <meta name="keywords" content="draggable,resizable,grid,layout,responsive,breakpoints,Svelte,svelte,svelte.js,sveltejs,usage,example,examples,samples,basic,showcase" />
  <meta name="author" content="Vahe Araqelyan" />
</svelte:head>

<h1>Hover</h1>

<a href="examples/arrow">→ Arrow</a>

<p>
  <a href="examples/eventPropagation">← preventDefault/stopPropagation</a>
</p>

<p>Click, hover and touch events</p>

<div class="link">
  <a target="_blank" href={`${openInSource}/basic.svelte`}>View this example's source</a>
  <a target="_blank" href="https://svelte.dev/repl/05578b5568864a329aa4af11a9094fbe?version=3.12.1">Open in repl</a>
</div>

<div class="group">
  <Popover arrowColor="#fff" action="click">
    <button slot="target">Click</button>
    <div slot="content" class="content">Content</div>
  </Popover>

  <Popover arrowColor="#fff" action="hover">
    <button slot="target">Hover</button>
    <div slot="content" class="content">Content</div>
  </Popover>

  <Popover arrowColor="#fff" action={false}>
    <button slot="target">None</button>
    <div slot="content" class="content">Content</div>
  </Popover>
</div>

<script>
  import { openInSource } from './github.js';
  import Popover from 'svelte-popover';
</script>
