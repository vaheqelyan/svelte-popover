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
  <meta name="description" content="Svelte-grid — Example — Basic" />
  <meta name="keywords" content="draggable,resizable,grid,layout,responsive,breakpoints,Svelte,svelte,svelte.js,sveltejs,usage,example,examples,samples,basic,showcase" />
  <meta name="author" content="Vahe Araqelyan" />
</svelte:head>

<h1>Basic</h1>

<a href="examples/eventPropagation">→ preventDefault/stopPropagation</a>

<p>Simply just click on the button</p>

<div class="link">
  <a target="_blank" href={`${openInSource}/basic.svelte`}>View this example's source</a>
  <a target="_blank" href="">Open in repl</a>
</div>

<Popover arrowColor="#fff">
  <button slot="target">Target</button>
  <div slot="content" class="content">Content</div>
</Popover>

<script>
  import { openInSource } from './github.js';
  import Popover from 'svelte-popover';
</script>
