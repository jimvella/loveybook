<script lang="ts">
  import "../app.css";
  import PDFPage from "$lib/PDFPage.svelte";

  /*
    A carousel style display for pdf files intended to be fun and engaging way for kids to navigate between pages.
    The carousel itself extends beyond the screen width and moves between pages using scrollLeft.
    A physics inspired model is applied to give the page turning process motion, and for the reader to 
    seek to the nearest page. 
  */

  // @ts-nocheck
  import * as pdfjs from "pdfjs-dist";
  import * as pdfWorker from "pdfjs-dist/build/pdf.worker.mjs";
  import { onMount, tick } from "svelte";
  pdfjs.GlobalWorkerOptions.workerSrc =
    import.meta.url + "pdfjs-dist/build/pdf.worker.mjs;../$types.js";

  let {
    // Physics model parameters
    snapStart,
    snapTransitionStart,
    friction,
    damping,
    accelerationFactor,
    velocitySmoothingFactor,
    pdfPromise,
  } = $props();

  //   const snapStart = 40;
  //   const snapTransitionStart = 120;
  //   const friction = 0.96;
  //   const damping = 0.01;
  //   const accelerationFactor = 0.5;
  //   const velocitySmoothingFactor = 0.8;

  let pages = $state([]);

  // Scrolling state
  let isDown = $state(false);
  let startX = $state(0);
  let startScrollLeft = $state(0);
  let scrollLeft = $state(0);

  // Scrolling element
  let slider: HTMLElement | undefined = $state();

  async function uriToArrayBuffer(uri) {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch URI: ${response.status} ${response.statusText}`
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  }

  // Physics model state
  let velocity = $state(0);
  let acceleration = $state(0);
  let animationFrameId = $state(0);

  function physicsModelLoop() {
    setScrollLeft((scrollLeft += velocity * 2));
    velocity =
      velocity * friction +
      acceleration -
      velocity * Math.abs(velocity) * damping;

    // TODO - could cancel once the page turn has completed
    animationFrameId = requestAnimationFrame(physicsModelLoop);
  }

  function beginPhysicsModel() {
    cancelPhysicsModel();
    animationFrameId = requestAnimationFrame(physicsModelLoop);
  }

  function cancelPhysicsModel() {
    cancelAnimationFrame(animationFrameId);
  }

  const setScrollLeft = (v) => {
    scrollLeft = v;

    // Transform the actual displayed position
    // This provies the snapping behaviour as scrolling approaches a fully turned state
    // As the full page turn is approached, the displayed position is biased towards the full page turn
    // such that once within a tolerance the page is dispayed as fully turned
    const mod = scrollLeft % width;
    if (mod < snapTransitionStart || width - mod < snapTransitionStart) {
      if (mod < snapStart || width - mod < snapStart) {
        // snap
        slider.scrollLeft = scrollLeft + (mod < snapStart ? -mod : width - mod);
      } else {
        // scale
        const sf = snapStart / (snapTransitionStart - snapStart);
        const dist = snapTransitionStart - Math.min(mod, width - mod);
        slider.scrollLeft =
          scrollLeft + (mod < snapTransitionStart ? -dist * sf : dist * sf);
      }
    } else {
      slider.scrollLeft = scrollLeft;
    }

    // Set acceleration as a function of position
    // This should drive pages away from being partially turned to completely turned
    if (scrollLeft < width) {
      acceleration = accelerationFactor;
    } else if (scrollLeft > width * pages.length) {
      acceleration = -accelerationFactor;
    } else {
      if (scrollLeft % width > width / 2) {
        acceleration = accelerationFactor;
      } else {
        acceleration = -accelerationFactor;
      }
    }
  };

  const onScrollStart = (x) => {
    startX = x - slider.offsetLeft;
    startScrollLeft = slider.scrollLeft;
    cancelPhysicsModel();
  };

  const onScrollMove = (x) => {
    const walk = x - slider.offsetLeft - startX; //scroll-fast
    var prevScrollLeft = slider.scrollLeft;
    setScrollLeft(startScrollLeft - walk);
    // Exponential filter
    velocity =
      (slider.scrollLeft - prevScrollLeft) * (1 - velocitySmoothingFactor) +
      velocity * velocitySmoothingFactor;
  };

  const onScrollEnd = () => {
    beginPhysicsModel();
  };

  onMount(() => {
    pdfPromise.then((i) => {
      pages = i;

      tick().then(() => {
        setScrollLeft(width);
      });
    });
  });

  let innerWidth = $state(0);
  let innerHeight = $state(0);
  let width = $derived(innerWidth);

  // Scale element width so given it's height it will fill the window
  const widthConsideringHeight = (page) => {
    const viewport = page.getViewport({ scale: 1 });
    const aspectRatio = viewport.width / viewport.height;
    return Math.min(innerWidth, innerHeight * aspectRatio);
  };
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div
  style="position:fixed !important;
position:absolute;
top:0;
right:0;
bottom:0;
left:0; display: flex; justify-content:center; align-items:center"
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    aria-roledescription="slider"
    class="whiskey-cards"
    style="width: {width}px"
    bind:this={slider}
    ontouchstart={(e) => {
      onScrollStart(e.targetTouches[0].pageX);
    }}
    ontouchmove={(e) => {
      e.preventDefault();
      onScrollMove(e.targetTouches[0].pageX);
    }}
    ontouchend={(e) => {
      onScrollEnd();
    }}
    onmousedown={(e) => {
      isDown = true;
      onScrollStart(e.pageX);
    }}
    onmouseup={(e) => {
      isDown = false;
      onScrollEnd();
    }}
    onmousemove={(e) => {
      if (!isDown) return;
      e.preventDefault();
      onScrollMove(e.pageX);
    }}
  >
    <div
      class="whiskey-card"
      style="padding: {width / 2}px {width / 2}px {width / 2}px"
    ></div>
    {#each pages as page}
      <div
        class="whiskey-card"
        style="padding-left: {(width - widthConsideringHeight(page)) /
          2}px; padding-right: {(width - widthConsideringHeight(page)) / 2}px"
      >
        <PDFPage {page} style="width: {widthConsideringHeight(page)}px" />
      </div>
    {/each}
    <div
      class="whiskey-card"
      style="padding: {width / 2}px {width / 2}px {width / 2}px"
    ></div>
  </div>
</div>

<style>
  body {
    margin: 0;
  }

  .whiskey-cards {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .whiskey-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
