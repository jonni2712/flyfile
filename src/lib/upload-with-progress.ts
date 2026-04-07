/**
 * PUT upload helper that reports byte-level progress via XHR.
 * Used for uploading files to R2 presigned URLs with real-time
 * progress events that fetch() cannot provide natively.
 *
 * Includes automatic retry with exponential backoff: 1s, 2s, 4s.
 * Each retry resets the per-file progress so the UI restarts the bar.
 */
export interface UploadOptions {
  /** Called as bytes are uploaded for the current attempt. */
  onProgress?: (bytesUploaded: number) => void;
  /** Called when an attempt fails and a retry is scheduled. */
  onRetry?: (attempt: number, maxAttempts: number) => void;
  /** Maximum total attempts (default 3). */
  maxAttempts?: number;
}

function attemptUpload(
  url: string,
  body: Blob | File,
  contentType: string,
  onProgress?: (bytesUploaded: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(e.loaded);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.onabort = () => reject(new Error('Upload aborted'));

    xhr.send(body);
  });
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function uploadWithProgress(
  url: string,
  body: Blob | File,
  contentType: string,
  onProgressOrOptions?: ((bytesUploaded: number) => void) | UploadOptions
): Promise<void> {
  // Backwards compat: accept a plain progress callback or an options object
  const options: UploadOptions =
    typeof onProgressOrOptions === 'function'
      ? { onProgress: onProgressOrOptions }
      : onProgressOrOptions || {};

  const maxAttempts = options.maxAttempts ?? 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await attemptUpload(url, body, contentType, options.onProgress);
      return;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        if (options.onRetry) options.onRetry(attempt, maxAttempts);
        // Exponential backoff: 1s, 2s, 4s, ...
        await sleep(1000 * Math.pow(2, attempt - 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Upload failed after retries');
}
