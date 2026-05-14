import "server-only";

export async function parseDocxBuffer(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid loading heavy dependencies on non-parsing routes
    const mammothModule = await import("mammoth");
    const mammoth =
      (mammothModule as unknown as { default?: typeof mammothModule }).default ??
      mammothModule;

    const result = await mammoth.extractRawText({ buffer });

    const text = result.value?.trim();
    if (!text) {
      throw new Error("EMPTY_DOCX_CONTENT");
    }

    return text;
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "EMPTY_DOCX_CONTENT") {
      throw new Error("The DOCX file appears to be empty or has no extractable text.");
    }
    console.error("DOCX parsing failed:", error);
    throw new Error("Failed to extract text from DOCX resume.");
  }
}
