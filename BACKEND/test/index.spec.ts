import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src";

describe("shrink URL Shortener Worker", () => {
	it("responds with standard greeting on root GET /", async () => {
		const request = new Request("http://example.com/");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(await response.text()).toBe("shrink URL Shortener");
	});

	it("fails to shorten with an invalid URL", async () => {
		const request = new Request("http://example.com/api/shorten", {
			method: "POST",
			body: JSON.stringify({ url: "invalid-link" }),
			headers: { "Content-Type": "application/json" }
		});
		const response = await SELF.fetch(request);
		expect(response.status).toBe(400);
		const data = (await response.json()) as any;
		expect(data.error).toBe("Invalid URL");
	});

	it("shortens a URL successfully with mock-test-token", async () => {
		const request = new Request("http://example.com/api/shorten", {
			method: "POST",
			body: JSON.stringify({ url: "https://google.com" }),
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer mock-test-token"
			}
		});
		const response = await SELF.fetch(request);
		expect(response.status).toBe(200);
		const data = (await response.json()) as any;
		expect(data.shortCode).toBeDefined();
		expect(data.shortUrl).toContain(data.shortCode);

		// Test resolving it via GET /api/resolve/:shortCode
		const resolveRequest = new Request(`http://example.com/api/resolve/${data.shortCode}`);
		const resolveResponse = await SELF.fetch(resolveRequest);
		expect(resolveResponse.status).toBe(200);
		const resolveData = (await resolveResponse.json()) as any;
		expect(resolveData.targetUrl).toBe("https://google.com/");
	});
});
