import "server-only";

/**
 * PDF Parsing Service using 'unpdf'.
 * 'unpdf' provides a stable wrapper around pdfjs-dist,
 * solving the common 'Object.defineProperty' and environment detection
 * issues encountered in Next.js 15 App Router and RSC.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  console.log("[PDF Parser] Starting extraction. Buffer length:", buffer.length);

  try {
    const uint8Array = new Uint8Array(buffer);

    // Try unpdf first (most reliable in Next.js environment)
    try {
      const { extractText } = await import("unpdf");
      console.log("[PDF Parser] Calling extractText with unpdf...");
      const result = await extractText(uint8Array, { mergePages: true });
      console.log("[PDF Parser] unpdf extractText completed.");

      let rawText = "";
      if (typeof result.text === "string") {
        rawText = result.text;
      } else if (Array.isArray(result.text)) {
        rawText = (result.text as string[]).join("\n");
      }

      const trimmed = rawText?.trim();
      if (trimmed && trimmed.length >= 10) {
        console.log("[PDF Parser] unpdf extraction successful. Length:", trimmed.length);
        return trimmed;
      }

      console.warn("[PDF Parser] unpdf returned empty text, trying fallback...");
    } catch (unpdfError) {
      console.warn("[PDF Parser] unpdf failed, trying pdfjs fallback:", unpdfError);
    }

    // Fallback: try pdfjs-dist legacy build directly
    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdfDoc = await loadingTask.promise;

      const textParts: string[] = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: unknown) => {
            const textItem = item as { str?: string };
            return textItem.str ?? "";
          })
          .join(" ");
        textParts.push(pageText);
      }

      const rawText = textParts.join("\n").trim();
      if (rawText && rawText.length >= 10) {
        console.log("[PDF Parser] pdfjs fallback successful. Length:", rawText.length);
        return rawText;
      }

      throw new Error("EMPTY_OR_CORRUPTED_PDF");
    } catch (pdfjsError) {
      if (pdfjsError instanceof Error && pdfjsError.message === "EMPTY_OR_CORRUPTED_PDF") {
        throw pdfjsError;
      }
      console.warn("[PDF Parser] pdfjs fallback also failed:", pdfjsError);
      throw new Error("EMPTY_OR_CORRUPTED_PDF");
    }
  } catch (error) {
    console.error("[PDF Parser] Critical Failure:", error);

    const message = error instanceof Error ? error.message : "";

    if (message.toLowerCase().includes("password")) {
      throw new Error("CANNOT_PARSE_PASSWORD_PROTECTED_PDF");
    }

    if (message === "EMPTY_OR_CORRUPTED_PDF") {
      throw new Error("The PDF appears to be empty or contains no extractable text.");
    }

    throw new Error(`FAILED_TO_EXTRACT_PDF_TEXT: ${message}`);
  }
}
