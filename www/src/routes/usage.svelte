<style>
  .scroll {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }
  td,
  th {
    text-align: left;
    padding: 8px;
  }
</style>

<svelte:head>
  <title>Svelte-popover — Usage</title>
  <meta name="keywords" content="svelte-popover,popover,usage"/>
  <meta name="author" content="Vahe Araqelyan"/>
</svelte:head>

<h2>Installation</h2>

<code>
  <pre>{`npm i svelte-grid --save-dev`}</pre>
</code>

<h2>Usage</h2>

<hr />

<p>
  Use
  <b>Grid</b>
  like any other component.
</p>

<p>The basic example</p>

<code>
  <pre>
    {`
    <Popover>
      <button slot=target>Click</button>
      <div slot=content>
        <h1>Content</h1>
      </div>
    </Popover>
  `}
  </pre>
</code>

<p>
  <a href="examples">See more examples</a>
</p>
You can also use nested popovers
<code>
  <pre>
    {`
    <Popover>
      <button slot=target>Click</button>
      <div slot=content>
        <h1>Content</h1>
        <Popover>
          <button slot=target></button>
          <div slot=content>
            <h1>Content</h1>
          </div>
        </Popover>
      </div>
    </Popover>
  `}
  </pre>
</code>
Use
<code>let:open</code>
directive. For example
<code>
  <pre>
    {`
    <Popover let:open={isOpen}>
      <button slot=target class:active={isOpen}>Target</button>
      <div slot=content>
        <h1>Content</h1>
      </div>
    </Popover>
  `}
  </pre>
</code>

<h2>Props</h2>

<div class="scroll">
  <table>
    <tr>
      <th>Prop</th>
      <th>Type</th>
      <th>Description</th>
      <th>Default</th>
      <th>Required</th>
    </tr>
    <tr>
      <td>let:open</td>
      <td>Boolean</td>
      <td>Returns the value of the visibility of a popover</td>
      <td>...</td>
      <td>✘</td>
    </tr>
    <tr>
      <td>arrow</td>
      <td>Boolean</td>
      <td>
        If
        <code>false</code>
        , the arrow is removed
      </td>
      <td>
        <code>true</code>
      </td>
      <td>✘</td>
    </tr>
    <tr>
      <td>placement</td>
      <td>String</td>
      <td>
        The placement of the popover.
        <code>top-start</code>
        ,
        <code>top-center</code>
        ,
        <code>top-end</code>
        ,
        <code>left-start</code>
        ,
        <code>left-center</code>
        ,
        <code>left-end</code>
        ,
        <code>right-start</code>
        ,
        <code>right-center</code>
        ,
        <code>right-end</code>
        ,
        <code>bottom-start</code>
        ,
        <code>bottom-center</code>
        ,
        <code>bottom-end</code>
      </td>
      <td>
        <code>auto</code>
      </td>
      <td>✘</td>
    </tr>
    <tr>
      <td>action</td>
      <td>String</td>
      <td>
        <code>click</code>
        |
        <code>hover</code>
        . Supports touch event
      </td>
      <td>
        <code>click</code>
      </td>
      <td>✘</td>
    </tr>
    <tr>
      <td>on:open</td>
      <td>Function</td>
      <td>
        <code>on:open</code>
        is dispatched/called when the content is mounted
      </td>
      <td>...</td>
      <td>✘</td>
    </tr>
    <tr>
      <td>on:close</td>
      <td>Function</td>
      <td>
        <code>on:close</code>
        is dispatched/called after the content is unmounted from the dom
      </td>
      <td>...</td>
      <td>✘</td>
    </tr>
    <tr>
      <td>open</td>
      <td>Boolean</td>
      <td>
        Whether the popover is visible. Passing this prop puts the popover in controlled mode.To make the popover completely manageable, you must pass the
        <code>null</code>
        value to the
        <code>action</code>
        prop
      </td>
      <td>false</td>
      <td>✘</td>
    </tr>

    <tr>
      <td>zIndex</td>
      <td>Number</td>
      <td>Initial number for zIndex</td>
      <td>
        <code>1000</code>
      </td>
      <td>✘</td>
    </tr>
    <tr>
      <td>overlayColor</td>
      <td>String</td>
      <td>Set the background color of an overlay element</td>
      <td>
        <code>rgba(0,0,0,0.5)</code>
      </td>
      <td>✘</td>
    </tr>
    <tr>
      <td>preventDefault</td>
      <td>Boolean</td>
      <td>
        Cancels the event if it is cancelable, meaning that the default action that belongs to the event will not occur.
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault" target="_blank">more</a>
      </td>
      <td>
        <code>false</code>
      </td>
      <td>✘</td>
    </tr>

    <tr>
      <td>stopPropagation</td>
      <td>Boolean</td>
      <td>
        Stops the bubbling of an event to parent elements, preventing any parent event handlers from being executed.
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation" target="_blank">more</a>
      </td>
      <td>
        <code>false</code>
      </td>
      <td>✘</td>
    </tr>

  </table>
</div>
