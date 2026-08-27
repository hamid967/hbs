import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { spaFallbackRoute } from "./vite";

let server: Server | undefined;

async function startFallbackServer() {
  const app = express();
  app.use(spaFallbackRoute, (req, res) => {
    res.status(200).type("html").send(`fallback:${req.originalUrl}`);
  });

  server = createServer(app);
  await new Promise<void>((resolve) => server!.listen(0, "127.0.0.1", resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

afterEach(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server!.close((error) => (error ? reject(error) : resolve()));
  });
  server = undefined;
});

describe("spaFallbackRoute", () => {
  it("matches both the root path and a deep SPA link under Express 5", async () => {
    const baseUrl = await startFallbackServer();
    const [root, deepLink] = await Promise.all([
      fetch(`${baseUrl}/`),
      fetch(`${baseUrl}/requests/new`),
    ]);

    expect(root.status).toBe(200);
    expect(deepLink.status).toBe(200);
    await expect(root.text()).resolves.toBe("fallback:/");
    await expect(deepLink.text()).resolves.toBe("fallback:/requests/new");
  });
});
