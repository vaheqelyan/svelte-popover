<style>
  .arrow {
    position: absolute;
    top: 0;
  }
  .content {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
  }
</style>

<div bind:this={contentRef} class="content" style="z-index: {zIndex + 10}; {positionStyle}">
  <slot />
  {#if arrow}
    <div bind:this={arrowRef} class="arrow" style="position: absolute; color: {arrowColor}; {arrowStyleProps}">◥</div>
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
  let arrowStyleProps = ``;

  const dispatch = createEventDispatcher();

  const setOpen = () => {
    dispatch('setOpen', {});
  };

  const calculate = () => {
    const targetBound = targetRef.getBoundingClientRect();
    const contentBound = contentRef.getBoundingClientRect();

    let arrowBound = { width: 0, height: 0 };
    if (arrow) {
      arrowBound = arrowRef.getBoundingClientRect();
    }

    const { innerWidth, innerHeight } = window;

    const calcCoverLeft = contentBound.x - contentBound.width;
    const coverLeft = calcCoverLeft < 0 ? calcCoverLeft : 0;

    const calcCoverRight = contentBound.x + targetBound.width + contentBound.width;
    const coverRight = calcCoverRight > innerWidth ? innerWidth - calcCoverRight : 0;

    const calcCoverTop = contentBound.y - contentBound.height;
    const coverTop = calcCoverTop < 0 ? calcCoverTop : 0;

    const calcCoverBottom = targetBound.bottom + contentBound.height;
    const coverBottom = calcCoverBottom > innerHeight ? innerHeight - calcCoverBottom : 0;

    const calcXCenterLeft = contentBound.x + targetBound.width / 2 - contentBound.width / 2;

    const calcXCenterRight = contentBound.x + targetBound.width / 2 - contentBound.width / 2 + contentBound.width;

    const coverXCenterLeft = calcXCenterLeft < 0 ? calcXCenterLeft : 0;

    const coverXCenterRight = calcXCenterRight > innerWidth ? innerWidth - calcXCenterRight : 0;

    const calcYCenterTop = contentBound.y + targetBound.height / 2 - contentBound.height / 2;

    const coverYCenterTop = calcYCenterTop < 0 ? calcYCenterTop : 0;

    const calcYCenterBottom = contentBound.y + targetBound.height / 2 - contentBound.height / 2 + contentBound.height;

    const coverYCenterBottom = calcYCenterBottom > innerHeight ? calcYCenterBottom : 0;

    const calcTopStart = contentBound.x + contentBound.width;
    const coverTopStart = calcTopStart > innerWidth ? innerWidth - calcTopStart : 0;

    const calcTopEnd = contentBound.x - (contentBound.width - targetBound.width);
    const coverTopEnd = calcTopEnd < 0 ? calcTopEnd : 0;

    const calcLeftEndTop = contentBound.y - (contentBound.height - targetBound.height);
    const coverLeftEndTop = calcLeftEndTop < 0 ? calcLeftEndTop : 0;

    const coverRightEndTop = coverLeftEndTop;

    const calcLefStartBottom = contentBound.y + contentBound.height;
    const coverLeftStartBottom = calcLefStartBottom > innerHeight ? innerHeight - calcLefStartBottom : 0;

    const coverRightStartBottom = coverLeftStartBottom;

    const coverBottomStartRight = coverTopStart;
    const coverBottomEndLeft = coverTopEnd;

    const xCenterStyle = targetBound.height / 2 - contentBound.height / 2;
    const rightLeftEnd = -(contentBound.height - targetBound.height);
    const topBottomEnd = -(contentBound.width - targetBound.width);
    const topBottomCenter = targetBound.width / 2 - contentBound.width / 2;

    const computeArrowW = arrowBound.width / 2;
    const computearrowH = arrowBound.height / 2;

    const leftLeftStyle = -(contentBound.width + computeArrowW);
    const topTopStyle = -(contentBound.height + arrowBound.height / 2);
    const rightLeftStyle = targetBound.width + computeArrowW;
    const bottomTopStyle = targetBound.height + computearrowH;

    const styles = {
      topStart: `top:${topTopStyle}px`,
      topCenter: `top:${topTopStyle}px;left:${topBottomCenter}px`,
      topEnd: `top:${topTopStyle}px;left:${topBottomEnd}px`,

      leftStart: `left:${leftLeftStyle}px`,
      leftCenter: `left:${leftLeftStyle}px;top:${xCenterStyle}px`,
      leftEnd: `left:${leftLeftStyle}px;top:${rightLeftEnd}px`,

      rightStart: `left:${rightLeftStyle}px`,
      rightCenter: `left:${rightLeftStyle}px;top:${xCenterStyle}px`,
      rightEnd: `left:${rightLeftStyle}px;top:${rightLeftEnd}px`,

      bottomStart: `top:${bottomTopStyle}px`,
      bottomCenter: `top:${bottomTopStyle}px;left:${topBottomCenter}px`,
      bottomEnd: `top:${bottomTopStyle}px;left:${topBottomEnd}px;`,
    };

    const arrowBottomTransform = `transform:rotate(-45deg)`;
    const arrowTopTransform = `transform: rotate(135deg)`;
    const arrowLeftTransform = `transform: rotate(45deg)`;
    const arrowRightTransform = `transform:rotate(45deg)`;

    const arrowBottomTop = Math.ceil(-arrowBound.height / 2);

    const arrowBottomTopCenter = contentBound.width / 2 - arrowBound.width / 2;

    const arrowTop = contentBound.height - arrowBound.height / 2;
    const arrowTopBottomEnd = targetBound.width / 2 - arrowBound.width / 2;

    const arrowLeftRightEnd = contentBound.height - arrowBound.height / 2 - targetBound.height / 2;

    const arrowLeftRightCenter = contentBound.height / 2 - Math.ceil(arrowBound.height / 2);
    const arrowTopBottomStartLeft = targetBound.width / 2 - arrowBound.width / 2;

    const arrowLeftLeft = Math.ceil(contentBound.width - arrowBound.width / 2);
    const arrowLeftRightTop = targetBound.height / 2 - arrowBound.height / 2;

    const arrowStyle = {
      topStart: `${arrowTopTransform};top:${arrowTop}px;left:${arrowTopBottomStartLeft}px`,
      topCenter: `${arrowTopTransform};top:${arrowTop}px;left:${arrowBottomTopCenter}px`,
      topEnd: `${arrowTopTransform};top:${arrowTop}px;right:${arrowTopBottomEnd}px`,

      leftStart: `${arrowLeftTransform};left:${arrowLeftLeft}px;top:${arrowLeftRightTop}px`,

      leftCenter: `${arrowLeftTransform};left:${arrowLeftLeft}px;top:${arrowLeftRightCenter}px`,

      leftEnd: `${arrowLeftTransform};left:${arrowLeftLeft}px;top:${arrowLeftRightEnd}px`,

      rightStart: `${arrowRightTransform};left:${-arrowBound.width}px;top:${arrowLeftRightTop}px`,

      rightCenter: `${arrowRightTransform};left:${-arrowBound.width}px;top:${arrowLeftRightCenter}px`,

      rightEnd: `${arrowRightTransform};left:${-arrowBound.width}px;top:${arrowLeftRightEnd}px`,

      bottomStart: `${arrowBottomTransform};top:${arrowBottomTop}px;left:${arrowTopBottomStartLeft}px`,
      bottomCenter: `${arrowBottomTransform};top:${arrowBottomTop}px;left:${arrowBottomTopCenter}px`,
      bottomEnd: `${arrowBottomTransform};top:${arrowBottomTop}px;right:${arrowTopBottomEnd}px`,
    };

    const pos = [
      {
        at: 'top-start',
        cover: [coverTop, coverTopStart, 0],
        style: styles.topStart,
        arrow: arrowStyle.topStart,
      },
      {
        at: 'top-center',
        cover: [coverTop, coverXCenterLeft, coverXCenterRight],
        style: styles.topCenter,
        arrow: arrowStyle.topCenter,
      },
      {
        at: 'top-end',
        cover: [coverTop, coverTopEnd, 0],
        style: styles.topEnd,
        arrow: arrowStyle.topEnd,
      },
      {
        at: 'left-start',
        cover: [coverLeft, coverLeftStartBottom, 0],
        style: styles.leftStart,
        arrow: arrowStyle.leftStart,
      },
      {
        at: 'left-center',
        cover: [coverLeft, coverYCenterTop, coverYCenterBottom],
        style: styles.leftCenter,
        arrow: arrowStyle.leftCenter,
      },
      {
        at: 'left-end',
        cover: [coverLeft, coverLeftEndTop, 0],
        style: styles.leftEnd,
        arrow: arrowStyle.leftEnd,
      },
      {
        at: 'right-start',
        cover: [coverRight, coverRightStartBottom, 0],
        style: styles.rightStart,
        arrow: arrowStyle.rightStart,
      },
      {
        at: 'right-center',
        cover: [coverRight, coverYCenterTop, coverYCenterBottom],
        style: styles.rightCenter,
        arrow: arrowStyle.rightCenter,
      },
      {
        at: 'right-end',
        cover: [coverRight, coverRightEndTop, 0],
        style: styles.rightEnd,
        arrow: arrowStyle.rightEnd,
      },
      {
        at: 'bottom-start',
        cover: [coverBottom, coverBottomStartRight, 0],
        style: styles.bottomStart,
        arrow: arrowStyle.bottomStart,
      },
      {
        at: 'bottom-center',
        cover: [coverBottom, coverXCenterLeft, coverXCenterRight],
        style: styles.bottomCenter,
        arrow: arrowStyle.bottomCenter,
      },
      {
        at: 'bottom-end',
        cover: [coverBottom, coverBottomEndLeft, 0],
        style: styles.bottomEnd,
        arrow: arrowStyle.bottomEnd,
      },
    ];

    let get;

    if (placement === 'auto') {
      const reducer = (accumulator, currentValue) => accumulator + currentValue;

      const compute = pos.map(({ cover }) => cover.reduce(reducer));
      const findIndex = compute.indexOf(Math.max(...compute));
      const result = pos[findIndex];
      get = result;
    } else {
      get = pos.filter(val => val.at === placement)[0];
    }
    const debug = pos.map(val => val.cover);

    positionStyle = get.style;
    arrowStyleProps = get.arrow;
  };

  onMount(() => {
    calculate();

    dispatch('open');
  });
</script>
