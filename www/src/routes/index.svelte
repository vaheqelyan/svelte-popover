<style>
  .block {
    padding: 20px;
    background: lightblue;
  }
  .pink {
    background: pink !important;
  }
  .group-btn {
    border: none;
  }

  .group {
    margin-left: 10px;
    display: inline-flex;
  }
  .black {
    background: black !important;
  }
  .black,
  .pink > * {
    color: white;
  }
  .flex {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .form {
    display: flex;
    flex-direction: column;
  }
  .welcome {
    text-align: center;
  }
  .margin-right {
    margin-right: 10px;
  }
  .active {
    color: white;
  }
  .content {
    padding: 10px;
    background: #fff;
  }
  .div-con {
    background: white;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 2px;
  }

  :global(.popover + .popover, .form, .block) {
    margin: 0 10px !important;
  }
  .list + .list {
    margin: 10px 0;
  }
</style>

<div class="welcome">
  <h1>Svelte-popover</h1>
  <h4>A smart and easy to use popover component for Svelte</h4>
</div>

<div class="flex">
  <Popover arrowColor="#fff">
    <button slot="target">Click</button>
    <div slot="content" class="content">
      <h1>Content</h1>
    </div>
  </Popover>

  <Popover arrowColor="#fff">
    <button slot="target">Nested</button>
    <div slot="content" class="content">
      <h1>Content</h1>
      <Popover arrowColor="#fff">
        <button slot="target">Nested</button>
        <div slot="content" class="content">
          <h1>Content</h1>
        </div>
      </Popover>
    </div>
  </Popover>

  <Popover arrowColor="#fff">
    <div slot="target" class="div-con">Div container</div>
    <div slot="content" class="content">
      <h1>Content</h1>
    </div>
  </Popover>

  <div class="form">
    <Popover let:open arrow={false} placement="right-start">
      <span slot="target" class:active={open} class="margin-right">✉</span>
      <div slot="content" class="content margin">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</div>
    </Popover>
    <input type="text" />
  </div>

  <Popover placement="bottom-center" arrowColor="#fff">
    <input slot="target" type="text" />
    <div slot="content" class="content" style="width: 500px;">
      {#each new Array(10) as item}
        <div class="list">List</div>
      {/each}
    </div>
  </Popover>

  <Popover action="hover" placement="bottom-center" arrowColor="white">
    <button slot="target">Hover</button>
    <div slot="content" class="content">
      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy</p>
    </div>
  </Popover>

  <Popover placement="bottom-center" arrowColor="pink">
    <button slot="target">Pink</button>
    <div slot="content" class="content pink">
      <h1>Content</h1>
    </div>
  </Popover>

  <Popover action="hover" placement="bottom-center" arrowColor="black">
    <button slot="target">Black</button>
    <div slot="content" class="content black">
      <h1>Content</h1>
    </div>
  </Popover>

  <a href="https://github.com/vaheqelyan" target="_blank">
    <Popover preventDefault placement="bottom-center" arrowColor="black">
      <span slot="target">preventDefault</span>
      <div slot="content" class="content black">
        <h1>Content</h1>
      </div>
    </Popover>
  </a>

  <div on:click={() => alert('clicked')} class="block">
    <Popover stopPropagation placement="bottom-center" arrowColor="black">
      <span slot="target">stopPropagation</span>
      <div slot="content" class="content black">
        <h1>stopPropagation</h1>
      </div>
    </Popover>
  </div>

  <Popover arrowColor="#fff" action={false}>
    <button slot="target">Disabled</button>
    <div slot="content" class="content">
      <h1>Content</h1>
    </div>
  </Popover>

  <div class="group">
    <div>
      <Popover action="hover" arrowColor="#fff">
        <button slot="target" class="group-btn">One</button>
        <div slot="content" class="content">
          <h1>Content</h1>
        </div>
      </Popover>
    </div>
    <div>
      <Popover action="hover" arrowColor="#fff">
        <button slot="target" class="group-btn">Two</button>
        <div slot="content" class="content">
          <h1>Content</h1>
        </div>
      </Popover>
    </div>
    <div>
      <Popover action="hover" arrowColor="#fff">
        <button slot="target" class="group-btn">Three</button>
        <div slot="content" class="content">
          <h1>Content</h1>
        </div>
      </Popover>
    </div>
  </div>

</div>

<script>
  import Popover from 'svelte-popover';
</script>
