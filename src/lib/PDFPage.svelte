<script lang="ts">
  import * as pdfjs from "pdfjs-dist";
  import { onMount } from "svelte";

  export let page: pdfjs.PDFPageProxy;
  export let style = "";

  export let afterRender = (context) => {};
  export let doRenderCallback = (callback) => {
    console.log("do render callback not installed");
  };

  let canvas;

  let outputScale;

  const doRender = () => {
    if (canvas) {
      const context = canvas.getContext("2d");

      const scale = 1.5;
      const viewport = page.getViewport({ scale: scale });

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);

      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      const renderContext = {
        canvasContext: context,
        transform: transform,
        viewport: viewport,
      };
      const r = page.render(renderContext);
      r.promise.then(() => {
        afterRender(context, canvas);
      });
    }
  };

  doRenderCallback(doRender);

  onMount(() => {
    outputScale = window.devicePixelRatio || 1;
    doRender();
  });
</script>

<canvas bind:this={canvas} {style} />

<style>
  .pageContainer {
    width: 45%;
  }

  @media screen and (max-width: 1240px) {
    .pageContainer {
      width: 100%;
    }
  }

  @media print and (max-width: 800px) {
    .pageContainer {
      width: 100%;
    }
  }
</style>
