<style>
  .content {
    display: inline-block;
    position: absolute;
  }
</style>

<div bind:this={contentRef} class="content" style="z-index: {zIndex + 10}; {positionStyle}">
  <slot />
  {#if arrow}
    <div bind:this={arrowRef} style="position: absolute; color: {arrowColor}; {arrowStyle}">◥</div>
  {/if}
</div>

<Overlay {zIndex} {action} on:setOpen={setOpen} {stopPropagation} {preventDefault} />

<script>
  export let arrowColor;
  export let targetRef;
  export let zIndex;
  export let arrow;
  export let placement;
  export let action;
  export let preventDefault;
  export let stopPropagation;

  import Overlay from './Overlay.svelte';
  import { onMount, createEventDispatcher } from 'svelte';

  let contentRef;
  let arrowRef;
  let positionStyle = ``;
  let arrowStyle = ``;

  const dispatch = createEventDispatcher();

  const setOpen = () => {
    dispatch('setOpen', {});
  };

  const calculate = () => {
    const targetBound = targetRef.getBoundingClientRect();
    const contentBound = contentRef.getBoundingClientRect();

    const atTop = targetBound.y - contentBound.height;
    const atRight = window.innerWidth - (targetBound.right + contentBound.width);
    const atLeft = targetBound.x - contentBound.width;

    const atBottom = window.innerHeight - (targetBound.bottom + contentBound.height);

    let arrowBound = { width: 0, height: 0 },
      arrowClientH = 0;
    if (arrow) {
      arrowBound = arrowRef.getBoundingClientRect();
      arrowClientH = arrowRef.clientHeight;
    }

    const pos = [
      {
        at: 'top-start',
        check1: atTop,
        check2: window.innerWidth - (targetBound.left + contentBound.width),
        check3: 0,
        style: `top:${-(contentBound.height + arrowClientH / 2)}px;left:0px;`,
        arrow: `transform: rotate(135deg);bottom:${-Math.ceil(arrowClientH / 2)}px;left:${Math.min(targetBound.width / 2, contentBound.width) - arrowBound.width / 2}px`,
      },
      {
        at: 'top-center',
        check1: atTop,
        check2: contentBound.x - targetBound.width - contentBound.width / 2 + targetBound.width / 2,
        check3: window.innerWidth - (contentBound.x - targetBound.width - contentBound.width / 2 + targetBound.width / 2 + contentBound.width),
        style: `top:${-(contentBound.height + arrowClientH / 2)}px;left:${-(contentBound.width / 2) + targetBound.width / 2}px`,
        arrow: `transform:rotate(135deg);bottom:${-Math.ceil(arrowClientH / 2)}px;left:${contentBound.width / 2 - arrowBound.width / 2}px`,
      },
      {
        at: 'top-end',
        check1: atTop,
        check2: targetBound.right - contentBound.width,
        check3: 0,
        style: `top:${-(contentBound.height + arrowBound.height / 2)}px;left:${-(contentBound.width - targetBound.width)}px`,
        arrow: `transform: rotate(135deg);bottom:${-arrowBound.height / 2}px;right:${Math.min(targetBound.width / 2, contentBound.width) - arrowBound.width / 2}px`,
      },
      {
        at: 'left-start',
        check1: atLeft,
        check2: window.innerHeight - (targetBound.top + contentBound.height),
        check3: 0,
        style: `left: ${-(contentBound.width + arrowBound.width / 2)}px`,
        arrow: `transform: rotate(45deg);top:${Math.min(targetBound.height / 2, contentBound.height) - arrowClientH / 2}px;left:${contentBound.width - arrowBound.width / 2}px`,
      },
      {
        at: 'left-center',
        check1: atLeft,
        check2: contentBound.y - (contentBound.height / 2 + targetBound.height / 2),
        check3: window.innerHeight - (contentBound.y - (contentBound.height / 2 + targetBound.height / 2) + contentBound.height),
        style: `left:${-(contentBound.width + arrowBound.width / 2)}px;top:${-(contentBound.height / 2 - targetBound.height / 2)}px`,
        arrow: `transform:rotate(45deg);left:${contentBound.width - arrowBound.width / 2}px;top:${contentBound.height / 2 - arrowClientH / 2}px`,
      },
      {
        at: 'left-end',
        check1: atLeft,
        check2: targetBound.bottom - contentBound.height,
        check3: 0,
        style: `left:${-(contentBound.width + arrowBound.width / 2)}px;top:${-(contentBound.height - targetBound.height)}px`,
        arrow: `transform:rotate(45deg);right:${-arrowBound.width / 2}px;bottom:${Math.min(targetBound.height / 2, contentBound.height) - arrowClientH / 2}px`,
      },
      {
        at: 'right-start',
        check1: atRight,
        check2: window.innerHeight - (targetBound.top + contentBound.height),
        check3: 0,
        style: `left:${targetBound.width + arrowBound.width / 2}px`,
        arrow: `transform:rotate(45deg);left:${-arrowBound.width}px;top:${Math.min(targetBound.height / 2, contentBound.height) - arrowClientH / 2}px;`,
      },
      {
        at: 'right-center',
        check1: atRight,
        check2: contentBound.y - (contentBound.height / 2 + targetBound.height / 2),
        check3: window.innerHeight - (contentBound.y - (contentBound.height / 2 + targetBound.height / 2) + contentBound.height),
        style: `top:${-(contentBound.height / 2 - targetBound.height / 2)}px;left:${targetBound.width + arrowBound.width / 2}px`,
        arrow: `left:${-arrowBound.width}px;top:${contentBound.height / 2 - arrowClientH / 2}px;transform:rotate(45deg)`,
      },
      {
        at: 'right-end',
        check1: atRight,
        check2: targetBound.bottom - contentBound.height,
        check3: 0,
        style: `left:${targetBound.width + arrowBound.width / 2}px;top:${-(contentBound.height - targetBound.height)}px`,
        arrow: `transform:rotate(45deg);left:${-arrowBound.width}px;bottom:${Math.min(targetBound.height / 2, contentBound.height) - arrowClientH / 2}px`,
      },
      {
        at: 'bottom-start',
        check1: atBottom,
        check2: window.innerWidth - (targetBound.left + contentBound.width),
        check3: 0,
        left: `top:${targetBound.height + arrowBound.height / 2}px;left:0px`,
        arrow: `transform:rotate(-45deg);top:${-(arrowBound.height / 2)}px;left:${Math.min(targetBound.width / 2, contentBound.width) - arrowBound.width / 2}px`,
      },
      {
        at: 'bottom-center',
        check1: atBottom,
        check2: contentBound.x - targetBound.width - contentBound.width / 2 + targetBound.width / 2,
        check3: window.innerWidth - (contentBound.x - targetBound.width - contentBound.width / 2 + targetBound.width / 2 + contentBound.width),
        style: `top:${targetBound.height + arrowClientH / 2}px;left:${-(contentBound.width / 2) + targetBound.width / 2}px`,
        arrow: `transform:rotate(-45deg);top:${-arrowClientH / 2}px;left:${contentBound.width / 2 - arrowBound.width / 2}px`,
      },
      {
        at: 'bottom-end',
        check1: atBottom,
        check2: atLeft,
        check3: 0,
        style: `top:${targetBound.height + arrowBound.height / 2}px;left:${-(contentBound.width - targetBound.width)}px`,
        arrow: `transform:rotate(-45deg);top:${-(arrowBound.height / 2)}px;right:${Math.min(targetBound.width / 2, contentBound.width) - arrowBound.width / 2}px`,
      },
    ];

    const compute = pos.map(val => val.check1 - (val.check2 - val.check3));
    const getIndex = compute.indexOf(Math.max(...compute));

    let get;
    if (placement !== 'auto') {
      get = pos.filter(val => val.at === placement)[0];
    } else {
      get = pos[getIndex];
    }
    positionStyle = get.style;
    arrowStyle = get.arrow;
  };

  onMount(() => {
    calculate();

    dispatch('open');
  });
</script>
