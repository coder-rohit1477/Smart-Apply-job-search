import "server-only";

/**
 * PDF Parsing Service using 'unpdf'.
 * 'unpdf' provides a stable, cross-runtime wrapper around pdfjs-dist,
 * solving the common 'Object.defineProperty' and environment detection
 * issues encountered in Next.js 15 App Router and RSC.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  console.log("[PDF Parser] Starting extraction. Buffer length:", buffer.length);

  try {
    // We use a dynamic import for 'unpdf' to ensure it's only loaded on the server
    // during actual parsing operations, keeping the main bundle lightweight.
    const { extractText, definePDFJSModule } = await import("unpdf");

    // Manually configure PDF.js if needed (especially for environments like Next.js RSC)
    try {
      await definePDFJSModule(() => import("pdfjs-dist/legacy/build/pdf.mjs"));
      console.log("[PDF Parser] unpdf configured with legacy PDF.js build.");
    } catch (configError) {
      console.warn("[PDF Parser] Failed to manually configure unpdf, attempting default resolution:", configError);
    }

    // 'unpdf' returns text which can be a string or an array of strings depending on the version/input.
    console.log("[PDF Parser] Calling extractText...");
    const result = await extractText(new Uint8Array(buffer));
    console.log("[PDF Parser] extractText completed. Result keys:", Object.keys(result));
    
    // Normalize text extraction result
    let rawText = "";
    if (typeof result.text === "string") {
      rawText = result.text;
      console.log("[PDF Parser] Result text is string. Length:", rawText.length);
    } else if (Array.isArray(result.text)) {
      rawText = result.text.join("\n");
      console.log("[PDF Parser] Result text is array. Item count:", result.text.length, "Total length:", rawText.length);
    } else {
      console.warn("[PDF Parser] result.text is of unexpected type:", typeof result.text);
    }

    const trimmedText = rawText?.trim();

    if (!trimmedText || trimmedText.length < 10) {
      console.warn("[PDF Parser] Extracted text is too short or empty. Length:", trimmedText?.length);
      // If no text is found, it might be an image-only PDF or corrupted.
      throw new Error("EMPTY_OR_CORRUPTED_PDF");
    }

    return trimmedText;
  } catch (error: any) {
    console.error("[PDF Parser] Critical Failure:", error);
    
    // Categorize errors for better user feedback in the UI.
    const message = error.message || "";
    if (message.includes("password")) {
      throw new Error("CANNOT_PARSE_PASSWORD_PROTECTED_PDF");
    }
    
    if (message === "EMPTY_OR_CORRUPTED_PDF") {
      throw new Error("The PDF appears to be empty or contains no extractable text.");
    }

    // Ensure we throw a descriptive error that the parser-service can handle.
    throw new Error(`FAILED_TO_EXTRACT_PDF_TEXT: ${message}`);
  }
}
