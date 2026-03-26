import * as https from 'https';
import * as http from 'http';

/**
 * A fallback fetch implementation using Node's native http/https modules.
 * Implements exponential backoff retries for ECONNRESET / ETIMEDOUT 
 * and forces new TCP connections to bypass stale sockets on Windows.
 */
export async function nodeHttpsFetch(urlStr: RequestInfo | URL, options?: RequestInit, retries = 3, backoff = 500): Promise<Response> {
    const attemptFetch = async (currentAttempt: number): Promise<Response> => {
        return new Promise((resolve, reject) => {
            const url = new URL(urlStr.toString());
            const isHttps = url.protocol === 'https:';
            const requestModule = isHttps ? https : http;

            const parsedHeaders: Record<string, string> = {};
            if (options?.headers) {
                if (typeof (options.headers as any).forEach === 'function') {
                    (options.headers as any).forEach((value: string, key: string) => {
                        parsedHeaders[key] = value;
                    });
                } else {
                    Object.assign(parsedHeaders, options.headers);
                }
            }

            const requestOptions: https.RequestOptions = {
                method: options?.method || 'GET',
                agent: isHttps ? new https.Agent({ keepAlive: false }) : new http.Agent({ keepAlive: false }),
                headers: parsedHeaders,
                family: 4,
                timeout: 8000 // 8 second timeout per attempt
            };

            // Double enforce no keep-alive
            parsedHeaders['Connection'] = 'close';

            const req = requestModule.request(url, requestOptions, (res) => {
                const chunks: any[] = [];

                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    const body = Buffer.concat(chunks);

                    const response = new Response(body, {
                        status: res.statusCode || 200,
                        statusText: res.statusMessage || 'OK',
                        headers: res.headers as any
                    });

                    Object.defineProperty(response, 'ok', {
                        get: () => res.statusCode ? res.statusCode >= 200 && res.statusCode < 300 : false
                    });

                    resolve(response);
                });
            });

            req.on('error', (err: any) => {
                reject(err);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`Timeout fetching ${urlStr}`));
            });

            if (options?.body) {
                req.write(options.body);
            }

            req.end();
        });
    };

    for (let i = 0; i <= retries; i++) {
        try {
            return await attemptFetch(i);
        } catch (err: any) {
            const isRetryable = err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.message?.includes('Timeout');

            if (i === retries || !isRetryable) {
                console.error(`[NodeHttpsFetch] Failed after ${i} retries targeting ${urlStr}:`, err.message || err.code);
                throw err;
            }

            console.warn(`[NodeHttpsFetch] Attempt ${i + 1} failed (${err.code || err.message}). Retrying in ${backoff}ms...`);
            await new Promise(r => setTimeout(r, backoff));
            backoff *= 2; // Exponential backoff (500ms, 1000ms, 2000ms...)
        }
    }

    throw new Error('Unreachable');
}
