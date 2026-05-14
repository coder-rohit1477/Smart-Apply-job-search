import "server-only";

export async function parseDocxBuffer(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid loading heavy dependencies on non-parsing routes
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim();

    if (!text) {
      throw new Error("EMPTY_DOCX_TEXT");
    }

    return text;
  } catch (error) {
    console.error("DOCX parsing failed:", error);
    throw new Error("Failed to extract text from DOCX resume.");
  }
}
