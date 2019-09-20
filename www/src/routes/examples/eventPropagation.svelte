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

<h1>preventDefault/stopPropagation</h1>

<a href="examples/hover">→ Hover</a>
<p>
  <a href="examples/basic">← Basic</a>
</p>

<p>
  In this example the popover is wrapped in
  <code>a</code>
  tag. Pass the
  <code>preventDefault</code>
  prop to disable default behavior
</p>

<div class="link">
  <a target="_blank" href={`${openInSource}/basic.svelte`}>View this example's source</a>
  <a target="_blank" href="">Open in repl</a>
</div>

<a href="https://github.com/vaheqelyan/svelte-grid" target="_blank">
  Link
  <Popover arrowColor="#fff" preventDefault>
    <button slot="target">Popover</button>
    <div slot="content" class="content">Content</div>
  </Popover>
</a>

<script>
  import { openInSource } from './github.js';
  import Popover from 'svelte-popover';
</script>
