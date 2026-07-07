import jwt from '@tsndr/cloudflare-worker-jwt';
import { nanoid } from 'nanoid';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Max-Age': '86400',
};

// Cloudflare Pages Function Handler
export const onRequest = async (context) => {
	const { request, env, next, waitUntil } = context;
	const url = new URL(request.url);
	const frontendUrl = env.FRONTEND_URL || url.origin;

	const verifyAuth = async (req) => {
		const authHeader = req.headers.get('Authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return { userId: null, error: 'Missing or invalid Authorization header' };
		}

		const token = authHeader.split(' ')[1];

		try {
			const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'apikey': env.SUPABASE_ANON_KEY,
				},
			});

			if (!res.ok) return { userId: null, error: `Auth failed: ${res.status}` };

			const data = await res.json();
			return { userId: data.id, error: null };
		} catch (e) {
			return { userId: null, error: `Auth error: ${e.message}` };
		}
	};

	// ─── GET /api/links — fetch all links for the authenticated user ───
	if (url.pathname === '/api/links' && request.method === 'GET') {
		const { userId, error } = await verifyAuth(request);
		if (!userId) {
			return new Response(JSON.stringify({ error: error || 'Unauthorized' }), {
				status: 401, headers: { 'Content-Type': 'application/json' }
			});
		}

		try {
			const indexStr = await env.LINKS.get(`user_links:${userId}`);
			const shortCodes = indexStr ? JSON.parse(indexStr) : [];

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
			const userLinks = links.filter((l) => l && l.userId === userId && !l.deleted);

			return new Response(JSON.stringify({ links: userLinks, usage: userLinks.length }), {
				headers: { 'Content-Type': 'application/json' }
			});
		} catch (e) {
			return new Response(JSON.stringify({ error: e.message }), {
				status: 500, headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	// ─── DELETE /api/links/:shortCode — delete a specific link ───
	const deleteMatch = url.pathname.match(/^\/api\/links\/([A-Za-z0-9]{4,12})$/);
	if (deleteMatch && request.method === 'DELETE') {
		const { userId, error } = await verifyAuth(request);
		if (!userId) {
			return new Response(JSON.stringify({ error: error || 'Unauthorized' }), {
				status: 401, headers: { 'Content-Type': 'application/json' }
			});
		}

		const shortCode = deleteMatch[1];
		const dataStr = await env.LINKS.get(shortCode);
		if (!dataStr) {
			return new Response(JSON.stringify({ error: 'Link not found' }), {
				status: 404, headers: { 'Content-Type': 'application/json' }
			});
		}

		const data = JSON.parse(dataStr);
		if (data.userId !== userId) {
			return new Response(JSON.stringify({ error: 'Forbidden' }), {
				status: 403, headers: { 'Content-Type': 'application/json' }
			});
		}

		// Soft delete
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
				status: 404, headers: { 'Content-Type': 'application/json' }
			});
		}
		try {
			const data = JSON.parse(dataStr);
			if (data.deleted) {
				return new Response(JSON.stringify({ error: 'Link has been deleted' }), {
					status: 410, headers: { 'Content-Type': 'application/json' }
				});
			}
			waitUntil(env.LINKS.put(shortCode, JSON.stringify({ ...data, clicks: (data.clicks || 0) + 1 })));
			return new Response(JSON.stringify({ targetUrl: data.targetUrl || dataStr }), {
				headers: { 'Content-Type': 'application/json' }
			});
		} catch {
			return new Response(JSON.stringify({ targetUrl: dataStr }), {
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	// ─── POST /api/shorten ───
	if (url.pathname === '/api/shorten' && request.method === 'POST') {
		try {
			const { url: targetUrl, alias, turnstileToken } = await request.json();

			let parsedUrl;
			try {
				parsedUrl = new URL(targetUrl);
				if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
			} catch {
				return new Response(JSON.stringify({ error: 'Invalid URL' }), {
					status: 400, headers: { 'Content-Type': 'application/json' }
				});
			}

			let shortCode = alias;
			if (alias) {
				if (await env.LINKS.get(alias)) {
					return new Response(JSON.stringify({ error: 'Alias already taken' }), {
						status: 409, headers: { 'Content-Type': 'application/json' }
					});
				}
			} else {
				for (let i = 0; i < 6; i++) {
					shortCode = nanoid(7);
					if (!(await env.LINKS.get(shortCode))) break;
					if (i === 5) throw new Error('Failed to generate unique code');
				}
			}

			const { userId } = await verifyAuth(request);

			if (!userId && !turnstileToken) {
				return new Response(JSON.stringify({ error: 'Turnstile required' }), {
					status: 400, headers: { 'Content-Type': 'application/json' }
				});
			}

			const ttl = userId ? 2592000 : 259200; // 30 days auth, 3 days anon
			const linkData = {
				targetUrl: parsedUrl.toString(),
				createdAt: new Date().toISOString(),
				clicks: 0,
				userId: userId || null
			};

			await env.LINKS.put(shortCode, JSON.stringify(linkData), { expirationTtl: ttl });

			if (userId) {
				waitUntil((async () => {
					const indexStr = await env.LINKS.get(`user_links:${userId}`);
					const codes = indexStr ? JSON.parse(indexStr) : [];
					if (!codes.includes(shortCode)) codes.unshift(shortCode);
					await env.LINKS.put(`user_links:${userId}`, JSON.stringify(codes));
				})());
			}

			return new Response(
				JSON.stringify({ shortCode, shortUrl: `${url.origin}/${shortCode}` }),
				{ headers: { 'Content-Type': 'application/json' } }
			);
		} catch (e) {
			return new Response(JSON.stringify({ error: e.message || 'Internal error' }), {
				status: 500, headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	// ─── GET /:shortCode — edge redirect ───
	if (request.method === 'GET' && !url.pathname.startsWith('/api/') && url.pathname !== '/') {
		const shortCode = url.pathname.slice(1).split('?')[0];
		
		// If it's short, check KV.
		if (shortCode && shortCode.length >= 4 && !shortCode.includes('.')) {
			const dataStr = await env.LINKS.get(shortCode);
			if (dataStr) {
				let targetUrl = dataStr;
				try {
					const data = JSON.parse(dataStr);
					if (data.deleted) return Response.redirect(`${frontendUrl}/not-found`, 302);
					targetUrl = data.targetUrl || dataStr;
					
					const ua = request.headers.get('user-agent') || '';
					let device = 'desktop';
					if (/mobile/i.test(ua)) device = 'mobile';
					else if (/tablet/i.test(ua)) device = 'tablet';

					const clickData = {
						timestamp: new Date().toISOString(),
						city: request.cf?.city || 'Unknown',
						country: request.cf?.country || 'Unknown',
						device
					};
					
					const clicksHistory = data.clicksHistory || [];
					clicksHistory.push(clickData);

					waitUntil(env.LINKS.put(shortCode, JSON.stringify({ 
						...data, 
						clicks: (data.clicks || 0) + 1,
						clicksHistory
					})));
				} catch {}
				return Response.redirect(targetUrl, 302);
			}
		}
	}

	// If no API routes or redirect matched, fallback to serving the React Frontend!
	return next();
};
