export class DataTransformer {
  // Transform raw provider data into a normalized format for AI agent
  transform(rawData: any[], provider: string): any[] {
    // Example: flatten, map fields, redact sensitive info, etc.
    return rawData.map(item => {
      // ...provider-specific transformation logic...
      return {
        ...item,
        provider,
        // Add/normalize fields as needed
      };
    });
  }
}
