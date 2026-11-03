import assert from "node:assert/strict";
import test from "node:test";
import { cloudflareRequestKind } from "./smoke-requests.mjs";

const base = "https://convert.afeiii.com";

test("recognizes both documented analytics destinations", () => {
	for (const url of [
		`${base}/cdn-cgi/rum?`,
		"https://cloudflareinsights.com/cdn-cgi/rum",
	])
		assert.equal(cloudflareRequestKind(url, "POST", base), "analytics");
	assert.equal(
		cloudflareRequestKind(
			"https://static.cloudflareinsights.com/beacon.min.js/version",
			"GET",
			base,
		),
		"analytics",
	);
});

test("recognizes only same-origin JavaScript detection POSTs", () => {
	const path = "/cdn-cgi/challenge-platform/h/g/jsd/oneshot/site/token/nonce";
	assert.equal(cloudflareRequestKind(base + path, "POST", base), "security");
	for (const [url, method] of [
		["https://example.invalid" + path, "POST"],
		[base + path, "PUT"],
		[base + path, "GET"],
		[base + "/cdn-cgi/challenge-platform/upload", "POST"],
		[base + "/cdn-cgi/challenge-platform/h/g/jsd/oneshot-upload", "POST"],
	])
		assert.equal(cloudflareRequestKind(url, method, base), null);
});

test("does not exempt uploads, lookalike hosts or unexpected methods", () => {
	for (const [url, method] of [
		[base + "/upload", "POST"],
		[base + "/api/upload", "POST"],
		[base + "/cdn-cgi/rum/upload", "POST"],
		[base + "/cdn-cgi/rum", "PUT"],
		["https://example.invalid/cdn-cgi/rum", "POST"],
		["https://convert.afeiii.com.example.invalid/cdn-cgi/rum", "POST"],
		["http://convert.afeiii.com/cdn-cgi/rum", "POST"],
		["https://convert.afeiii.com:8443/cdn-cgi/rum", "POST"],
		["https://user:password@convert.afeiii.com/cdn-cgi/rum", "POST"],
		["https://static.cloudflareinsights.com/beacon.min.js", "POST"],
		["https://static.cloudflareinsights.com/beacon.min.js.evil", "GET"],
	])
		assert.equal(cloudflareRequestKind(url, method, base), null);
});
