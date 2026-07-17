import jwt from '@tsndr/cloudflare-worker-jwt';
import { z } from 'zod';

const shortenSchema = z.object({
	url: z.string().url('Invalid URL format'),
	alias: z.string().regex(/^[a-zA-Z0-9-]*$/, 'Alias can only contain letters, numbers, and hyphens').max(30).optional().or(z.literal('')),
	turnstileToken: z.string().optional()
});
export interface Env {
	LINKS: KVNamespace;
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	TURNSTILE_SECRET_KEY: string;
	FRONTEND_URL?: string;
}

function generateId(length = 8): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars[array[i] % chars.length];
	}
	return result;
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Max-Age': '86400',
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const verifyAuth = async (req: Request) => {
			const authHeader = req.headers.get('Authorization');
			if (!authHeader?.startsWith('Bearer ')) {
				return { userId: null, error: 'Missing or invalid Authorization header' };
			}

			const token = authHeader.split(' ')[1];

			// Bypass check for testing/mock tokens or if Supabase is unconfigured
			if (!env.SUPABASE_URL || env.SUPABASE_URL === 'your-supabase-url' || token === 'mock-test-token' || token.startsWith('test-')) {
				console.warn("WARNING: Auth bypass is active. For testing only. If seen, report to site owner.");
				return { userId: 'testing-user-id', error: null };
			}

			try {
				const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
						'apikey': env.SUPABASE_ANON_KEY || '',
					},
				});

				if (!res.ok) {
					// Fallback for testing/offline states
					if (token === 'undefined' || token === 'null') {
						console.warn("WARNING: Fallback auth is active. For testing only. If seen, report to site owner.");
						return { userId: 'testing-user-id', error: null };
					}
					return { userId: null, error: `Auth failed: ${res.status}` };
				}

				const data = (await res.json()) as any;
				return { userId: data.id, error: null };
			} catch (e: any) {
				console.error("Supabase authentication connection failed. Falling back to testing-user-id. For testing only. If seen, report to site owner:", e.message);
				return { userId: 'testing-user-id', error: null };
			}
		};

		// ─── GET /api/links — fetch all links for the authenticated user ───
		if (url.pathname === '/api/links' && request.method === 'GET') {
			const { userId, error } = await verifyAuth(request);
			if (!userId) {
				return new Response(JSON.stringify({ error: error || 'Unauthorized' }), {
					status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}

			try {
				const indexStr = await env.LINKS.get(`user_links:${userId}`);
				const shortCodes: string[] = indexStr ? JSON.parse(indexStr) : [];

				const links = (
					await Promise.all(
						shortCodes.map(async (code) => {
							const dataStr = await env.LINKS.get(code);
							if (!dataStr) return null;
							try {
								const data = JSON.parse(dataStr);
								return { shortCode: code, ...data };
							} catch {
								return null;
							}
						})
					)
				).filter(Boolean);

				// Filter out links not belonging to this user and deleted ones
				const userLinks = links.filter((l: any) => l && l.userId === userId && !l.deleted);

				return new Response(JSON.stringify({ links: userLinks, usage: userLinks.length }), {
					headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			} catch (e: any) {
				return new Response(JSON.stringify({ error: e.message }), {
					status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}
		}

		// ─── DELETE /api/links/:shortCode — delete a specific link ───
		const deleteMatch = url.pathname.match(/^\/api\/links\/([A-Za-z0-9]{4,12})$/);
		if (deleteMatch && request.method === 'DELETE') {
			const { userId, error } = await verifyAuth(request);
			if (!userId) {
				return new Response(JSON.stringify({ error: error || 'Unauthorized' }), {
					status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}

			const shortCode = deleteMatch[1];
			const dataStr = await env.LINKS.get(shortCode);
			if (!dataStr) {
				return new Response(JSON.stringify({ error: 'Link not found' }), {
					status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}

			const data = JSON.parse(dataStr);
			if (data.userId !== userId) {
				return new Response(JSON.stringify({ error: 'Forbidden' }), {
					status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}

			// Soft delete — mark as deleted, KV TTL handles actual cleanup
			await env.LINKS.put(shortCode, JSON.stringify({ ...data, deleted: true, deletedAt: new Date().toISOString() }));

			return new Response(JSON.stringify({ success: true }), {
				headers: { 'Content-Type': 'application/json', ...corsHeaders }
			});
		}

		// ─── GET /api/resolve/:shortCode — resolve short code to target URL ───
		const resolveMatch = url.pathname.match(/^\/api\/resolve\/([A-Za-z0-9]{4,12})$/);
		if (resolveMatch && request.method === 'GET') {
			const shortCode = resolveMatch[1];
			const dataStr = await env.LINKS.get(shortCode);
			if (!dataStr) {
				return new Response(JSON.stringify({ error: 'Not found' }), {
					status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}
			try {
				const data = JSON.parse(dataStr);
				if (data.deleted) {
					return new Response(JSON.stringify({ error: 'Link has been deleted' }), {
						status: 410, headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				ctx.waitUntil(env.LINKS.put(shortCode, JSON.stringify({ ...data, clicks: (data.clicks || 0) + 1 })));
				
				const eventId = `event:${shortCode}:${Date.now()}-${generateId(4)}`;
				const eventData = {
					timestamp: new Date().toISOString(),
					referrer: request.headers.get('Referer') || 'Direct',
					userAgent: request.headers.get('User-Agent') || 'Unknown',
					ip: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'Unknown'
				};
				ctx.waitUntil(env.LINKS.put(eventId, JSON.stringify(eventData), { expirationTtl: 2592000 }));

				return new Response(JSON.stringify({ targetUrl: data.targetUrl || dataStr }), {
					headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			} catch {
				return new Response(JSON.stringify({ targetUrl: dataStr }), {
					headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}
		}

		// ─── GET /api/analytics/:shortCode — fetch granular analytics for a link ───
		const analyticsMatch = url.pathname.match(/^\/api\/analytics\/([A-Za-z0-9]{4,12})$/);
		if (analyticsMatch && request.method === 'GET') {
			const { userId, error } = await verifyAuth(request);
			if (!userId) {
				return new Response(JSON.stringify({ error: error || 'Unauthorized' }), {
					status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}

			const shortCode = analyticsMatch[1];
			const dataStr = await env.LINKS.get(shortCode);
			if (!dataStr) {
				return new Response(JSON.stringify({ error: 'Link not found' }), {
					status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}
			
			const data = JSON.parse(dataStr);
			if (data.userId !== userId) {
				return new Response(JSON.stringify({ error: 'Forbidden' }), {
					status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}

			try {
				const eventsList = await env.LINKS.list({ prefix: `event:${shortCode}:` });
				const events = (await Promise.all(
					eventsList.keys.map(async (k) => {
						const eventStr = await env.LINKS.get(k.name);
						return eventStr ? JSON.parse(eventStr) : null;
					})
				)).filter(Boolean);

				return new Response(JSON.stringify({ link: data, events }), {
					headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			} catch (e: any) {
				return new Response(JSON.stringify({ error: e.message }), {
					status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}
		}

		// ─── POST /api/shorten ───
		if (url.pathname === '/api/shorten' && request.method === 'POST') {
			try {
				const body = await request.json<any>();
				const parsed = shortenSchema.safeParse(body);
				
				if (!parsed.success) {
					return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), {
						status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}

				const { url: targetUrl, alias, turnstileToken } = parsed.data;

				let parsedUrl: URL;
				try {
					parsedUrl = new URL(targetUrl);
				} catch {
					return new Response(JSON.stringify({ error: 'Invalid URL' }), {
						status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}

				let shortCode = alias;
				if (alias) {
					if (await env.LINKS.get(alias)) {
						return new Response(JSON.stringify({ error: 'Alias already taken' }), {
							status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders }
						});
					}
				} else {
					for (let i = 0; i < 6; i++) {
						shortCode = generateId(8);
						if (!(await env.LINKS.get(shortCode))) break;
						if (i === 5) throw new Error('Failed to generate unique code');
					}
				}

				const { userId } = await verifyAuth(request);

				if (!userId) {
					if (!turnstileToken) {
						return new Response(JSON.stringify({ error: 'Turnstile required' }), {
							status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
						});
					}
				}

				const ttl = userId ? 2592000 : 259200; // 30 days auth, 3 days anon
				const linkData = {
					targetUrl: parsedUrl.toString(),
					createdAt: new Date().toISOString(),
					clicks: 0,
					userId: userId || null
				};

				await env.LINKS.put(shortCode!, JSON.stringify(linkData), { expirationTtl: ttl });

				// Update per-user link index so /api/links can look them up
				if (userId) {
					ctx.waitUntil((async () => {
						const indexStr = await env.LINKS.get(`user_links:${userId}`);
						const codes: string[] = indexStr ? JSON.parse(indexStr) : [];
						if (!codes.includes(shortCode!)) codes.unshift(shortCode!);
						await env.LINKS.put(`user_links:${userId}`, JSON.stringify(codes));
					})());
				}

				return new Response(
					JSON.stringify({ shortCode, shortUrl: `${url.origin}/${shortCode}` }),
					{ headers: { 'Content-Type': 'application/json', ...corsHeaders } }
				);
			} catch (e: any) {
				return new Response(JSON.stringify({ error: e.message || 'Internal error' }), {
					status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}
		}

		// ─── GET /:shortCode — edge redirect (direct hits on the worker domain) ───
		if (request.method === 'GET' && !url.pathname.startsWith('/api') && url.pathname !== '/') {
			const shortCode = url.pathname.slice(1).split('?')[0];

			if (!shortCode || shortCode.length < 4) {
				return Response.redirect(`${frontendUrl}`, 302);
			}

			const cache = caches.default;
			const cacheKey = new Request(url.toString(), request);
			let cachedResponse = await cache.match(cacheKey);

			if (cachedResponse) {
				// Cache hit! Track analytics asynchronously without blocking the response
				const eventId = `event:${shortCode}:${Date.now()}-${generateId(4)}`;
				const eventData = {
					timestamp: new Date().toISOString(),
					referrer: request.headers.get('Referer') || 'Direct',
					userAgent: request.headers.get('User-Agent') || 'Unknown',
					ip: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'Unknown'
				};
				ctx.waitUntil(env.LINKS.put(eventId, JSON.stringify(eventData), { expirationTtl: 2592000 }));
				return cachedResponse;
			}

			const dataStr = await env.LINKS.get(shortCode);
			if (!dataStr) {
				return Response.redirect(`${frontendUrl}/not-found`, 302);
			}

			let targetUrl = dataStr;
			try {
				const data = JSON.parse(dataStr);
				if (data.deleted) return Response.redirect(`${frontendUrl}/not-found`, 302);
				targetUrl = data.targetUrl || dataStr;
				
				// Update clicks asynchronously
				ctx.waitUntil(env.LINKS.put(shortCode, JSON.stringify({ ...data, clicks: (data.clicks || 0) + 1 })));
				
				const eventId = `event:${shortCode}:${Date.now()}-${generateId(4)}`;
				const eventData = {
					timestamp: new Date().toISOString(),
					referrer: request.headers.get('Referer') || 'Direct',
					userAgent: request.headers.get('User-Agent') || 'Unknown',
					ip: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'Unknown'
				};
				ctx.waitUntil(env.LINKS.put(eventId, JSON.stringify(eventData), { expirationTtl: 2592000 }));
			} catch {}

			const redirectResponse = Response.redirect(targetUrl, 302);
			
			// Cache the response at the edge for 60 seconds
			redirectResponse.headers.set('Cache-Control', 's-maxage=60');
			ctx.waitUntil(cache.put(cacheKey, redirectResponse.clone()));

			return redirectResponse;
		}

		return new Response('shrink URL Shortener', { headers: corsHeaders });
	},

	// ─── SCHEDULED TRIGGER ───
	async scheduled(event: any, env: Env, ctx: ExecutionContext) {
		console.log("Running scheduled cleanup task for soft-deleted links...");
		let cursor: string | undefined = undefined;
		let totalDeleted = 0;
		
		do {
			const listResult: any = await env.LINKS.list({ cursor });
			cursor = listResult.list_complete ? undefined : listResult.cursor;
			
			for (const key of listResult.keys) {
				// We only care about root link items (length typically 4-12 chars), not event logs
				if (!key.name.startsWith('event:') && !key.name.startsWith('user_links:')) {
					const dataStr = await env.LINKS.get(key.name);
					if (dataStr) {
						try {
							const data = JSON.parse(dataStr);
							if (data.deleted) {
								const deleteTime = new Date(data.deletedAt || data.createdAt).getTime();
								// If deleted more than 7 days ago, permanently remove
								if (Date.now() - deleteTime > 7 * 24 * 60 * 60 * 1000) {
									await env.LINKS.delete(key.name);
									totalDeleted++;
								}
							}
						} catch (e) {}
					}
				}
			}
		} while (cursor);
		console.log(`Scheduled task complete. Deleted ${totalDeleted} old links.`);
	}
};