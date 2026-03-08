#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";

// Types for SOL Claimer API responses
interface EmptyAccountsAnalysis {
  success: boolean;
  data: {
    accountsToClose: number;
    totalSol: number;
  };
  timestamp: string;
}

interface AccountDetail {
  pubkey: string;
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  lamports: number;
  state: string;
  closeAuthority: string | null;
  usdValue: number;
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: string;
  isVerifiedContract: boolean;
}

interface BurnableAccountsAnalysis {
  success: boolean;
  data: {
    accountsToBurn: number;
    totalSol: number;
    totalUsdValue: number;
    accountDetails: AccountDetail[];
  };
  timestamp: string;
}

interface HowItWorksResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    features: Array<{
      name: string;
      description: string;
      solRecovery: string;
    }>;
    website: string;
  };
  timestamp: string;
}

// SOL Claimer API Client
class SolClaimerApiClient {
  private apiClient: AxiosInstance;

  constructor(baseUrl: string = "http://localhost:3000") {
    this.apiClient = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async analyzeEmptyAccounts(walletAddress: string): Promise<EmptyAccountsAnalysis> {
    try {
      const response = await this.apiClient.post<EmptyAccountsAnalysis>(
        "/api/v1/accounts/analyze-empty",
        { walletAddress }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to analyze empty accounts: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async analyzeBurnableAccounts(walletAddress: string): Promise<BurnableAccountsAnalysis> {
    try {
      const response = await this.apiClient.post<BurnableAccountsAnalysis>(
        "/api/v1/accounts/analyze-burnable",
        { walletAddress }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to analyze burnable accounts: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getHowItWorks(): Promise<HowItWorksResponse> {
    try {
      const response = await this.apiClient.get<HowItWorksResponse>("/api/v1/info/how-it-works");
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get how it works: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// MCP Server Setup
const server = new Server(
  {
    name: "solclaimer-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const apiClient = new SolClaimerApiClient(
  process.env.SOLCLAIMER_API_URL || "http://localhost:3000"
);

// Define tools
const tools: Tool[] = [
  {
    name: "analyze_empty_accounts",
    description:
      "Analyze a Solana wallet for empty token accounts that can be closed to recover rent. " +
      "Returns the number of empty accounts and total SOL that can be recovered.",
    inputSchema: {
      type: "object" as const,
      properties: {
        wallet_address: {
          type: "string",
          description:
            "The Solana wallet address to analyze (e.g., '7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri')",
        },
      },
      required: ["wallet_address"],
    },
  },
  {
    name: "analyze_burnable_accounts",
    description:
      "Analyze a Solana wallet for token accounts with balances worth less than $1 USD that can be burned and closed. " +
      "Returns detailed information about each burnable account including token name, symbol, and USD value.",
    inputSchema: {
      type: "object" as const,
      properties: {
        wallet_address: {
          type: "string",
          description: "The Solana wallet address to analyze",
        },
      },
      required: ["wallet_address"],
    },
  },
  {
    name: "get_how_it_works",
    description:
      "Get information about SOL Claimer features and how it helps recover SOL from token accounts.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// Tool call handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "analyze_empty_accounts") {
      const walletAddress = (args as Record<string, string>).wallet_address;
      if (!walletAddress) {
        throw new Error("wallet_address is required");
      }

      const result = await apiClient.analyzeEmptyAccounts(walletAddress);
      return {
        content: [
          {
            type: "text",
            text: formatEmptyAccountsResponse(result),
          },
        ],
      };
    } else if (name === "analyze_burnable_accounts") {
      const walletAddress = (args as Record<string, string>).wallet_address;
      if (!walletAddress) {
        throw new Error("wallet_address is required");
      }

      const result = await apiClient.analyzeBurnableAccounts(walletAddress);
      return {
        content: [
          {
            type: "text",
            text: formatBurnableAccountsResponse(result),
          },
        ],
      };
    } else if (name === "get_how_it_works") {
      const result = await apiClient.getHowItWorks();
      return {
        content: [
          {
            type: "text",
            text: formatHowItWorksResponse(result),
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Response formatters
function formatEmptyAccountsResponse(data: EmptyAccountsAnalysis): string {
  if (!data.success) {
    return "Failed to analyze empty accounts";
  }

  return `
Empty Token Accounts Analysis
=============================
Accounts to Close: ${data.data.accountsToClose}
Total SOL to Recover: ${data.data.totalSol} SOL

This wallet has ${data.data.accountsToClose} empty token accounts that can be closed to recover ${data.data.totalSol} SOL in rent fees.
`;
}

function formatBurnableAccountsResponse(data: BurnableAccountsAnalysis): string {
  if (!data.success) {
    return "Failed to analyze burnable accounts";
  }

  let response = `
Burnable Token Accounts Analysis
=================================
Total Accounts to Burn: ${data.data.accountsToBurn}
Total SOL to Recover: ${data.data.totalSol} SOL
Total USD Value: $${data.data.totalUsdValue.toFixed(2)}

Accounts Details:
`;

  data.data.accountDetails.forEach((account, index) => {
    response += `
${index + 1}. ${account.tokenName} (${account.tokenSymbol})
   Mint: ${account.mint}
   Amount: ${account.uiAmount} (${account.amount} smallest units)
   USD Value: $${account.usdValue.toFixed(2)}
   Lamports (rent): ${account.lamports}
   Verified Contract: ${account.isVerifiedContract ? "Yes" : "No"}
`;
  });

  return response;
}

function formatHowItWorksResponse(data: HowItWorksResponse): string {
  if (!data.success) {
    return "Failed to get how it works information";
  }

  let response = `
${data.data.title}
${"=".repeat(data.data.title.length)}

${data.data.description}

Features:
`;

  data.data.features.forEach((feature) => {
    response += `
- ${feature.name}
  ${feature.description}
  SOL Recovery: ${feature.solRecovery}
`;
  });

  response += `

Website: ${data.data.website}
`;

  return response;
}

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SOL Claimer MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
