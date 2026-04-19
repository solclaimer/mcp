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
  uiAmount: number | null;
  lamports: number;
  state: string;
  closeAuthority: string | null;
  usdValue: number;
  tokenName?: string;
  tokenSymbol?: string;
  tokenLogo?: string;
  isVerifiedContract?: boolean;
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

interface SwappableAccountsAnalysis {
  success: boolean;
  data: {
    accountsToSwap: number;
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

  constructor(baseUrl: string = "https://api.solclaimer.app") {
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
      throw new Error(`Failed to analyze empty accounts: ${this.formatApiError(error)}`);
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
      throw new Error(`Failed to analyze burnable accounts: ${this.formatApiError(error)}`);
    }
  }

  async analyzeSwappableAccounts(walletAddress: string): Promise<SwappableAccountsAnalysis> {
    try {
      const response = await this.apiClient.post<SwappableAccountsAnalysis>(
        "/api/v1/accounts/analyze-swappable",
        { walletAddress }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to analyze swappable accounts: ${this.formatApiError(error)}`);
    }
  }

  async getHowItWorks(): Promise<HowItWorksResponse> {
    try {
      const response = await this.apiClient.get<HowItWorksResponse>("/api/v1/info/how-it-works");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get how it works: ${this.formatApiError(error)}`);
    }
  }

  private formatApiError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const apiMessage =
        typeof error.response?.data === "object" &&
        error.response?.data !== null &&
        "error" in error.response.data &&
        typeof (error.response.data as { error?: { message?: unknown } }).error?.message === "string"
          ? (error.response.data as { error: { message: string } }).error.message
          : null;

      if (status && apiMessage) {
        return `${status} - ${apiMessage}`;
      }

      if (status) {
        return `status ${status}`;
      }
    }

    return error instanceof Error ? error.message : "Unknown error";
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
  process.env.SOLCLAIMER_API_URL || "https://api.solclaimer.app"
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
  {
    name: "analyze_swappable_accounts",
    description:
      "Analyze a Solana wallet for token accounts with amount > 0 that can be swapped and then closed. " +
      "Returns detailed token information for each swappable account.",
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
    } else if (name === "analyze_swappable_accounts") {
      const walletAddress = (args as Record<string, string>).wallet_address;
      if (!walletAddress) {
        throw new Error("wallet_address is required");
      }

      const result = await apiClient.analyzeSwappableAccounts(walletAddress);
      return {
        content: [
          {
            type: "text",
            text: formatSwappableAccountsResponse(result),
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

Claim link: https://solclaimer.app
`;
}

function formatTokenLabel(account: AccountDetail): string {
  const tokenName = account.tokenName?.trim() || "Unknown Token";
  const tokenSymbol = account.tokenSymbol?.trim() || "N/A";
  return `${tokenName} (${tokenSymbol})`;
}

function formatUsd(value: number | undefined): string {
  const safeValue = Number.isFinite(value) ? (value as number) : 0;

  if (safeValue === 0) {
    return "$0";
  }

  if (safeValue < 0.000001) {
    return "<$0.000001";
  }

  return `$${safeValue.toFixed(6)}`;
}

function formatTokenAmount(account: AccountDetail): string {
  const parsedRawAmount = Number(account.amount);
  const computedUiAmount =
    Number.isFinite(parsedRawAmount) && account.decimals >= 0
      ? parsedRawAmount / 10 ** account.decimals
      : 0;
  const uiAmount = account.uiAmount ?? computedUiAmount;

  return `${uiAmount} (${account.amount} smallest units)`;
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
Total USD Value: ${formatUsd(data.data.totalUsdValue)}

Accounts Details:
`;

  if (data.data.accountDetails.length === 0) {
    response += "No burnable token accounts found.\n";
  }

  data.data.accountDetails.forEach((account, index) => {
    response += `
${index + 1}. ${formatTokenLabel(account)}
   Mint: ${account.mint}
   Amount: ${formatTokenAmount(account)}
   USD Value: ${formatUsd(account.usdValue)}
   Lamports (rent): ${account.lamports}
   Verified Contract: ${account.isVerifiedContract ? "Yes" : "No"}
`;
  });

  response += `
Burn link: https://solclaimer.app
`;

  return response;
}

function formatSwappableAccountsResponse(data: SwappableAccountsAnalysis): string {
  if (!data.success) {
    return "Failed to analyze swappable accounts";
  }

  let response = `
Swappable Token Accounts Analysis
=================================
Total Accounts to Swap: ${data.data.accountsToSwap}
Total SOL to Recover (after swap and close): ${data.data.totalSol} SOL
Total USD Value: ${formatUsd(data.data.totalUsdValue)}

Accounts Details:
`;

  if (data.data.accountDetails.length === 0) {
    response += "No swappable token accounts found with amount > 0.\n";
  }

  data.data.accountDetails.forEach((account, index) => {
    response += `
${index + 1}. ${formatTokenLabel(account)}
   Mint: ${account.mint}
   Amount: ${formatTokenAmount(account)}
   USD Value: ${formatUsd(account.usdValue)}
   Lamports (rent): ${account.lamports}
   Verified Contract: ${account.isVerifiedContract ? "Yes" : "No"}
`;
  });

  response += `
Swap link: https://solclaimer.app
`;

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

SOL Claimer is a Solana SPL token manager built to help users clean up token accounts and recover locked rent fees.

Core Features:
- Claim Rent Fee: Close empty token accounts and reclaim SOL rent.
- Create SPL / SPL22 Tokens: Launch standard SPL and Token-2022 assets.
- Mint New Coins: Mint additional token supply when needed.
- Bulk Send Tokens: Distribute tokens to multiple wallets in one operation.
- Burn Scam / Worthless Coins: Remove unwanted low-value tokens and recover rent.
- Swap Tiny Amounts and Get Rent Fee: Convert dust balances and close accounts to unlock SOL.

How Rent Claiming Works:
On Solana, token accounts hold rent-exempt SOL. When those accounts are no longer needed, closing them returns that SOL to your wallet. SOL Claimer helps identify eligible accounts, then guides users through burning or clearing balances and closing accounts to claim rent safely.

Additional API-Defined Features:
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
