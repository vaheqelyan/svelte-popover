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
  <title>Example — preventDefault/stopPropagation</title>
  <meta name="description" content="Svelte-grid — Example — preventDefault/stopPropagation" />
  <meta name="keywords" content="svelte-popover,popover,preventDefault,stopPropagation" />
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
  <a target="_blank" href="https://svelte.dev/repl/201072c0224f4fd2a7c2f2037dd780c2?version=3.12.1">Open in repl</a>
</div>

<a href="https://github.com/vaheqelyan/svelte-popover" target="_blank">
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
