import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response, NextFunction } from "express";
import { TOOL_DEFINITIONS } from "./tools/definitions.js";
import { routeTool } from "./tools/router.js";

// ─── Build MCP Server ─────────────────────────────────────────────────────────

function createServer(): McpServer {
  const server = new McpServer({
    name: "unified-ads-mcp",
    version: "1.0.0",
  });

  // Register all tools
  for (const tool of TOOL_DEFINITIONS) {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema.properties as Record<string, unknown>,
      async (args: Record<string, unknown>) => {
        try {
          const result = await routeTool(tool.name, args);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          return {
            content: [{ type: "text" as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      }
    );
  }

  return server;
}

// ─── Transport Selection ──────────────────────────────────────────────────────

async function startStdio() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[unified-ads-mcp] Running on stdio transport");
}

async function startHttp() {
  const PORT = parseInt(process.env.PORT ?? "3003", 10);
  const SECRET = process.env.API_SECRET;

  const app = express();
  app.use(express.json());

  // Bearer token auth middleware (required in HTTP mode)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!SECRET) {
      console.error("[WARN] API_SECRET not set — server is unauthenticated!");
      return next();
    }
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${SECRET}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  });

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      server: "unified-ads-mcp",
      version: "1.0.0",
      tools: TOOL_DEFINITIONS.length,
      platforms: ["google_ads", "meta", "tiktok", "linkedin"],
    });
  });

  // MCP endpoint
  app.all("/mcp", async (req: Request, res: Response) => {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });
    res.on("close", () => server.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.listen(PORT, () => {
    console.log(`[unified-ads-mcp] HTTP server running on http://localhost:${PORT}/mcp`);
    console.log(`[unified-ads-mcp] Health check: http://localhost:${PORT}/health`);
    console.log(`[unified-ads-mcp] Tools registered: ${TOOL_DEFINITIONS.length}`);
  });
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

const transport = process.env.TRANSPORT ?? "stdio";

if (transport === "http") {
  startHttp().catch(console.error);
} else {
  startStdio().catch(console.error);
}
