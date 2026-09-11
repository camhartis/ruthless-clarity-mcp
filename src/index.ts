#!/usr/bin/env node
/**
 * Ruthless Clarity MCP Server
 * Decision-discipline harness based on the Ruthless Clarity protocol.
 *
 * Hard gates force agents through:
 * 1. Define Victory
 * 2. Parallel Diagnostic Loop (Map Reality + Controlling Variable + Kill Options)
 * 3. Downstream execution only after artifacts exist
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Session state (in-memory, session-scoped only)
// ---------------------------------------------------------------------------

interface ProtocolState {
  victory?: {
    condition: string;
    verificationMethod: string;
    grandmotherTest: string;
    locked: boolean;
  };
  diagnostic?: {
    realityMap: string;
    controllingVariable: string;
    manipulabilityConfirmed: boolean;
    killLog: Array<{ option: string; constraint: string; killed: boolean }>;
    completed: boolean;
  };
  needle?: {
    metric: string;
    target: string;
    verificationMethod: string;
  };
  decision?: {
    statement: string;
    locked: boolean;
  };
  verification?: {
    result: "met" | "not_met";
    evidence: string;
  };
}

const state: ProtocolState = {};

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "ruthless-clarity-mcp",
  version: "0.1.0",
});

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

server.tool(
  "define_victory",
  "Lock a verifiable Victory Condition. Must be a state, not an action or feeling. Passes the grandmother test. Required before any diagnostic or downstream work.",
  {
    condition: z
      .string()
      .describe("One-sentence verifiable state that must be true for the work to have been worth doing"),
    verificationMethod: z
      .string()
      .describe("How we will know the state is true (objective check)"),
    grandmotherTest: z
      .string()
      .describe("Plain-language version a non-expert can use to judge win/lose"),
    unknownsOrRisks: z
      .string()
      .optional()
      .describe("Key unknowns, assumptions, or risks that must be resolved"),
  },
  async ({ condition, verificationMethod, grandmotherTest, unknownsOrRisks }) => {
    if (!condition || condition.length < 10) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: Victory condition is too vague or empty. It must be a specific, verifiable state.",
          },
        ],
        isError: true,
      };
    }

    state.victory = {
      condition,
      verificationMethod,
      grandmotherTest,
      locked: true,
    };

    // Reset downstream state when victory is redefined
    state.diagnostic = undefined;
    state.needle = undefined;
    state.decision = undefined;
    state.verification = undefined;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Victory locked",
              victory: state.victory,
              next: "Call run_diagnostic_loop next. Chapters 2-4 run as one parallel loop.",
              note: unknownsOrRisks ? `Recorded risks/unknowns: ${unknownsOrRisks}` : undefined,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "run_diagnostic_loop",
  "Run the parallel diagnostic loop (Chapters 2+3+4): Map Reality + Identify Controlling Variable + Kill Options Early. Requires a locked Victory Condition. This is the highest-value tool.",
  {
    realityMap: z
      .string()
      .describe(
        "Structured reality map: segments, real handoffs, real owners, undocumented workarounds, approval gates, variable inventory"
      ),
    controllingVariable: z
      .string()
      .describe(
        "The single rate, volume, or action we can directly change that has the highest causal impact on the Victory Condition"
      ),
    manipulabilityProof: z
      .string()
      .describe(
        "Proof that we can change this variable this afternoon without waiting for external permission or luck"
      ),
    killLog: z
      .array(
        z.object({
          option: z.string(),
          constraintFailed: z.string(),
          killed: z.boolean(),
        })
      )
      .describe("Every option considered and the first constraint that killed it (or survived)"),
  },
  async ({ realityMap, controllingVariable, manipulabilityProof, killLog }) => {
    if (!state.victory?.locked) {
      return {
        content: [
          {
            type: "text",
            text: "HARD GATE: define_victory must be called and locked before run_diagnostic_loop.",
          },
        ],
        isError: true,
      };
    }

    // Manipulability test
    const proofLower = manipulabilityProof.toLowerCase();
    const looksManipulable =
      proofLower.includes("can") ||
      proofLower.includes("today") ||
      proofLower.includes("this afternoon") ||
      proofLower.includes("immediately") ||
      proofLower.includes("directly");

    if (!looksManipulable || controllingVariable.toLowerCase().includes("whether")) {
      return {
        content: [
          {
            type: "text",
            text: `REJECTED: Controlling variable failed the manipulability test.\nVariable: "${controllingVariable}"\nProof given: "${manipulabilityProof}"\n\nIt must be a rate, volume, or action we can change this afternoon without external permission or luck. "Whether" statements and outcome hopes are invalid.`,
          },
        ],
        isError: true,
      };
    }

    state.diagnostic = {
      realityMap,
      controllingVariable,
      manipulabilityConfirmed: true,
      killLog: killLog.map((k) => ({
        option: k.option,
        constraint: k.constraintFailed,
        killed: k.killed,
      })),
      completed: true,
    };

    const killedCount = killLog.filter((k) => k.killed).length;
    const survived = killLog.filter((k) => !k.killed).map((k) => k.option);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Diagnostic loop complete",
              controllingVariable,
              manipulabilityConfirmed: true,
              killSummary: {
                totalOptions: killLog.length,
                killed: killedCount,
                survived,
              },
              next: "Call set_needle_metric, then proceed to irreversible bets and execution.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "set_needle_metric",
  "Lock the single needle metric that is causally linked to both the Victory Condition and the Controlling Variable. Everything else is noise.",
  {
    metric: z.string().describe("The single causal metric"),
    target: z.string().describe("Target value or band"),
    verificationMethod: z.string().describe("How the metric will be measured"),
  },
  async ({ metric, target, verificationMethod }) => {
    if (!state.diagnostic?.completed) {
      return {
        content: [
          {
            type: "text",
            text: "HARD GATE: run_diagnostic_loop must complete before set_needle_metric.",
          },
        ],
        isError: true,
      };
    }

    state.needle = { metric, target, verificationMethod };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Needle metric locked",
              needle: state.needle,
              next: "Propose a small irreversible bet (propose_irreversible_bet).",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "propose_irreversible_bet",
  "Propose a small irreversible bet that produces real information. Prefer smaller than fear says.",
  {
    bet: z.string().describe("Description of the small irreversible bet"),
    expectedNeedleMovement: z.string().describe("How the needle is expected to move"),
    rollbackCondition: z.string().describe("Clear condition under which we roll back"),
    timeBox: z.string().describe("Time box for the bet"),
  },
  async ({ bet, expectedNeedleMovement, rollbackCondition, timeBox }) => {
    if (!state.needle) {
      return {
        content: [
          {
            type: "text",
            text: "HARD GATE: set_needle_metric must be called first.",
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Bet recorded",
              bet,
              expectedNeedleMovement,
              rollbackCondition,
              timeBox,
              next: "After the bet, call lock_decision once the cut is clear.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "lock_decision",
  "Make the cut once. Lock the decision and protect it from casual reopening.",
  {
    decisionStatement: z.string().describe("Clear statement of the locked decision"),
    protectionMechanism: z
      .string()
      .describe("How casual reopening is prevented (written authorization, owner, etc.)"),
  },
  async ({ decisionStatement, protectionMechanism }) => {
    if (!state.needle) {
      return {
        content: [
          {
            type: "text",
            text: "HARD GATE: diagnostic and needle must exist before locking a decision.",
          },
        ],
        isError: true,
      };
    }

    state.decision = {
      statement: decisionStatement,
      locked: true,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Decision locked",
              decision: state.decision,
              protection: protectionMechanism,
              next: "After implementation, call verify_cut against the needle metric.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "verify_cut",
  "Verify the cut against the needle metric. Do not celebrate until the metric has moved as required.",
  {
    measuredResult: z.string().describe("Actual measured result against the needle"),
    victoryMet: z.boolean().describe("Whether the Victory Condition is now met"),
    evidence: z.string().describe("Evidence trail"),
  },
  async ({ measuredResult, victoryMet, evidence }) => {
    if (!state.decision?.locked || !state.needle) {
      return {
        content: [
          {
            type: "text",
            text: "HARD GATE: a locked decision and needle metric are required before verification.",
          },
        ],
        isError: true,
      };
    }

    state.verification = {
      result: victoryMet ? "met" : "not_met",
      evidence,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: victoryMet ? "Victory condition MET" : "Victory condition NOT MET",
              measuredResult,
              evidence,
              next: victoryMet
                ? "Call rollback_or_double_down with double_down, then codify_lesson."
                : "Call rollback_or_double_down with rollback.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "rollback_or_double_down",
  "Forced binary response to verification. If failed → rollback immediately. If succeeded → double down faster than comfort allows.",
  {
    action: z.enum(["rollback", "double_down"]).describe("The only two legal actions"),
    nextAction: z.string().describe("Immediate concrete next action"),
  },
  async ({ action, nextAction }) => {
    if (!state.verification) {
      return {
        content: [
          {
            type: "text",
            text: "HARD GATE: verify_cut must be called first.",
          },
        ],
        isError: true,
      };
    }

    const consistent =
      (state.verification.result === "met" && action === "double_down") ||
      (state.verification.result === "not_met" && action === "rollback");

    if (!consistent) {
      return {
        content: [
          {
            type: "text",
            text: `INCONSISTENT: Verification was "${state.verification.result}" but action was "${action}". Protocol requires rollback on failure and double-down on success.`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: `Action taken: ${action}`,
              nextAction,
              next:
                action === "double_down"
                  ? "Call codify_lesson so the learning is written into the system."
                  : "Return to diagnostic or redefine as needed.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "codify_lesson",
  "Write the paid-for lesson into system memory so the same hero is not required next time.",
  {
    lesson: z.string().describe("One-sentence paid-for lesson"),
    systemLocation: z.string().describe("Where in the system the lesson now lives"),
    controlMechanism: z
      .string()
      .describe("Control that catches drift without the original person"),
    recurrencePathKilled: z.string().describe("How the old failure path is now blocked"),
  },
  async ({ lesson, systemLocation, controlMechanism, recurrencePathKilled }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Lesson codified",
              lesson,
              systemLocation,
              controlMechanism,
              recurrencePathKilled,
              note: "A lesson that lives only in one head will be relearned at full price.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "get_protocol_status",
  "Return which Protocol gates have been satisfied in the current session.",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              victoryLocked: !!state.victory?.locked,
              diagnosticComplete: !!state.diagnostic?.completed,
              controllingVariable: state.diagnostic?.controllingVariable ?? null,
              needleSet: !!state.needle,
              decisionLocked: !!state.decision?.locked,
              verification: state.verification?.result ?? null,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "export_artifacts",
  "Export the structured Protocol artifacts produced so far in this session.",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(state, null, 2),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Ruthless Clarity MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
