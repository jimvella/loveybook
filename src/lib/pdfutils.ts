// @ts-nocheck
import * as pdfjs from "pdfjs-dist";
import * as pdfWorker from "pdfjs-dist/build/pdf.worker.mjs";
pdfjs.GlobalWorkerOptions.workerSrc =
  import.meta.url + "pdfjs-dist/build/pdf.worker.mjs";

export const fetchAndLoadPdf = async ({
  url: string,
  fetch = fetch /* optional supply fetch implementation */,
}) => {};
