// Cloudflare owns these endpoints; application uploads remain unexpected writes.
// https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/
// https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/
export function cloudflareRequestKind(rawUrl, method, base) {
	const url = new URL(rawUrl);
	if (url.protocol !== "https:" || url.username || url.password) return null;
	const sameOrigin = url.origin === new URL(base).origin;
	if (
		["GET", "HEAD"].includes(method) &&
		url.hostname === "static.cloudflareinsights.com" &&
		!url.port &&
		(url.pathname === "/beacon.min.js" ||
			url.pathname.startsWith("/beacon.min.js/"))
	)
		return "analytics";
	if (method !== "POST") return null;
	if (
		url.pathname === "/cdn-cgi/rum" &&
		(sameOrigin || (url.hostname === "cloudflareinsights.com" && !url.port))
	)
		return "analytics";
	if (
		sameOrigin &&
		/^\/cdn-cgi\/challenge-platform\/h\/[gb]\/jsd\/oneshot\/.+/.test(
			url.pathname,
		)
	)
		return "security";
	return null;
}
