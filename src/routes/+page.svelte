<script>
  import KidsPdfReader from "$lib/KidsPDFReader.svelte";
  import * as pdfjs from "pdfjs-dist";
  import * as pdfWorker from "pdfjs-dist/build/pdf.worker.mjs";

  let snapStart = $state(40);
  let snapTransitionStart = $state(120);
  let friction = $state(0.96);
  let damping = $state(0.01);
  let accelerationFactor = $state(0.5);
  let velocitySmoothingFactor = $state(0.8);
  let backgroundColor = $state("FFFFFF");

  let files = $state();
  let pdfPromise = $state();
  let showReader = $state(false);

  $effect(() => {
    console.log("files", files);
    if (files) {
      console.log("file", files[0]);
    }
  });

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

  const demoPdfPromise = uriToArrayBuffer("Dragon School.pdf").then((buff) => {
    const loadingTask = pdfjs.getDocument(buff);
    return loadingTask.promise.then(function (pdf) {
      return Promise.all(
        Array(pdf._pdfInfo.numPages)
          .fill()
          .map((item, index) => {
            const pageNumber = index + 1;
            return pdf.getPage(pageNumber);
          })
      );
    });
  });
</script>

{#if showReader}
  <KidsPdfReader
    {snapStart}
    {snapTransitionStart}
    {friction}
    {damping}
    {accelerationFactor}
    {velocitySmoothingFactor}
    {pdfPromise}
  />
{:else}
  <div
    style="display: flex; flex-direction: column; align-items:center; margin:4em"
  >
    <h1>A PDF reader for kids</h1>

    <p style="margin-bottom: 2em;">
      A simple web based PDF reader intended to make navigating between pages
      fun and engaging for kids. I've popped this togeather in my spare time for
      presenting PDF books prepared by freinds and family to my kids, as well as
      e-books for kids that are available in the PDF format. Free to use under
      the <a href="https://opensource.org/license/mit">MIT</a>
      licence.
    </p>

    <button
      onclick={() => {
        pdfPromise = demoPdfPromise;
        showReader = true;
      }}>Demo</button
    >
    <p>
      featuring 'Dragon School' from
      <a href="https://www.bookbotkids.com/free-books"
        >https://www.bookbotkids.com/free-books</a
      >
    </p>

    <div>
      <h3>Reader parameters</h3>

      <input type="file" accept="application/pdf" bind:files />
      <div class="myForm">
        <label>Snap start</label>
        <input type="text" bind:value={snapStart} />
        <label>Snap transition start</label>
        <input type="text" bind:value={snapTransitionStart} />
        <label>Friction factor</label>
        <input type="text" bind:value={friction} />
        <label>Damping factor</label>
        <input type="text" bind:value={damping} />
        <label>Acceleration factor</label>
        <input type="text" bind:value={accelerationFactor} />
        <label>Velocity smoothing factor</label>
        <input type="text" bind:value={velocitySmoothingFactor} />
        <!-- <label>Background color</label>
      <input type="text" /> -->
      </div>
      <button
        onclick={() => {
          pdfPromise = new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const buff = event.target?.result;

              const loadingTask = pdfjs.getDocument(buff);
              return loadingTask.promise
                .then(function (pdf) {
                  return Promise.all(
                    Array(pdf._pdfInfo.numPages)
                      .fill()
                      .map((item, index) => {
                        const pageNumber = index + 1;
                        return pdf.getPage(pageNumber);
                      })
                  );
                })
                .then((i) => {
                  resolve(i);
                });
            };
            reader.readAsArrayBuffer(files[0]);
          });
          showReader = true;
        }}>Start reader</button
      >
    </div>
  </div>
{/if}

<style>
:root {
    font-family:
      Arial,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      "Open Sans",
      "Helvetica Neue",
      sans-serif;
    --font-mono: "Fira Mono", monospace;
    --pure-white: #ffffff;
    --primary-color: #b9c6d2;
    --secondary-color: #d0dde9;
    --tertiary-color: #edf0f8;
    --accent-color: #ff3e00;
    --heading-color: rgba(0, 0, 0, 0.7);
    --text-color: #444444;
    --background-without-opacity: rgba(255, 255, 255, 0.7);
    --column-width: 42rem;
    --column-margin-top: 4rem;
  }

  .myForm {
    display: grid;
    grid-template-columns: [labels] auto [controls] 1fr;
    grid-auto-flow: row;
    grid-gap: 0.8em;
    /* background: #eee; */
    padding: 1.2em;
    max-width: 400px;
  }
  .myForm > label {
    grid-column: labels;
    grid-row: auto;
  }
  .myForm > input,
  .myForm > textarea,
  /* .myForm > button {
    grid-column: controls;
    grid-row: auto;
    border: none;
    padding: 1em;
  } */
</style>
