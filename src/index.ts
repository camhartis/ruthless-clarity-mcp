#!/usr/bin/env node
/**
 * Ruthless Clarity MCP Server
 * Decision-discipline harness based on the Ruthless Clarity protocol.
 *
 * Hard gates force agents through:
 * 1. Define Victory
 * 2. Atomic diagnostic package (Map Reality + Controlling Variable + Kill Options)
 * 3. Needle → Bet → Lock → Verify → Rollback/Double-down → Codify
 *
 * Silent skips are rejected: bet required before lock, verification required
 * before codify, rollback clears downstream state.
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
  bet?: {
    bet: string;
    expectedNeedleMovement: string;
    rollbackCondition: string;
    timeBox: string;
    recorded: boolean;
  };
  decision?: {
    statement: string;
    locked: boolean;
  };
  verification?: {
    result: "met" | "not_met";
    evidence: string;
  };
  lastAction?: "rollback" | "double_down";
}

const state: ProtocolState = {};

function clearFromDiagnosticDown(): void {
  state.diagnostic = undefined;
  state.needle = undefined;
  state.bet = undefined;
  state.decision = undefined;
  state.verification = undefined;
  state.lastAction = undefined;
}

function clearFromNeedleDown(): void {
  state.needle = undefined;
  state.bet = undefined;
  state.decision = undefined;
  state.verification = undefined;
  state.lastAction = undefined;
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "ruthless-clarity-mcp",
  version: "0.1.1",
});

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

server.tool(
  "define_victory",
  "Lock a verifiable Victory Condition. Must be a state, not an action or feeling. Passes the grandmother test. Required before any diagnostic or downstream work. Calling again resets all downstream artifacts.",
  {
    condition: z
      .string()
      .describe(
        "One-sentence verifiable state that must be true for the work to have been worth doing"
      ),
    verificationMethod: z
      .string()
      .describe("How we will know the state is true (objective check)"),
    grandmotherTest: z
      .string()
      .describe(
        "Plain-language version a non-expert can use to judge win/lose"
      ),
    unknownsOrRisks: z
      .string()
      .optional()
      .describe("Key unknowns, assumptions, or risks that must be resolved"),
  },
  async ({ condition, verificationMethod, grandmotherTest, unknownsOrRisks }) => {
    if (!condition || condition.trim().length < 10) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: Victory condition is too vague or empty. It must be a specific, verifiable state (not an action or feeling).",
          },
        ],
        isError: true,
      };
    }

    if (!verificationMethod || verificationMethod.trim().length < 5) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: verificationMethod is required. State the objective check that proves the victory condition.",
          },
        ],
        isError: true,
      };
    }

    if (!grandmotherTest || grandmotherTest.trim().length < 5) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: grandmotherTest is required. Plain language a non-expert can use to judge win/lose.",
          },
        ],
        isError: true,
      };
    }

    state.victory = {
      condition: condition.trim(),
      verificationMethod: verificationMethod.trim(),
      grandmotherTest: grandmotherTest.trim(),
      locked: true,
    };

    clearFromDiagnosticDown();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Victory locked",
              victory: state.victory,
              next: "Call run_diagnostic_loop next with reality map + controlling variable + kill log as one atomic package.",
              note: unknownsOrRisks
                ? `Recorded risks/unknowns: ${unknownsOrRisks}`
                : undefined,
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
  "Commit the atomic diagnostic package (Chapters 2+3+4): reality map + controlling variable + kill log. Conceptually parallel reasoning; one operational commit. Requires locked Victory. Rejects empty kill logs and non-manipulable variables.",
  {
    realityMap: z
      .string()
      .describe(
        "Structured reality map: segments (3-7), real handoffs with owners, undocumented workarounds, approval gates, variable inventory"
      ),
    controllingVariable: z
      .string()
      .describe(
        "The single rate, volume, or action we can directly change that has the highest causal impact on the Victory Condition. Not an outcome or 'whether'."
      ),
    manipulabilityProof: z
      .string()
      .describe(
        "Concrete proof we can change this variable this afternoon without external permission or luck. State the specific action."
      ),
    hardConstraints: z
      .array(z.string())
      .describe("Named hard constraints used to kill options. At least one required."),
    killLog: z
      .array(
        z.object({
          option: z.string(),
          constraintFailed: z
            .string()
            .describe("Constraint that killed it, or 'survived' if not killed"),
          killed: z.boolean(),
        })
      )
      .describe(
        "Every option considered. At least one row required. Empty logs are rejected."
      ),
  },
  async ({
    realityMap,
    controllingVariable,
    manipulabilityProof,
    hardConstraints,
    killLog,
  }) => {
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

    if (!realityMap || realityMap.trim().length < 20) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: realityMap is too thin. Include segments, handoffs/owners, workarounds, and variable inventory.",
          },
        ],
        isError: true,
      };
    }

    if (!hardConstraints || hardConstraints.length < 1) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: hardConstraints must list at least one named constraint before options are evaluated.",
          },
        ],
        isError: true,
      };
    }

    if (!killLog || killLog.length < 1) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: killLog cannot be empty. Record every option considered and the first constraint that killed it (or 'survived').",
          },
        ],
        isError: true,
      };
    }

    const cv = controllingVariable.trim();
    const proof = manipulabilityProof.trim();

    if (!cv || cv.length < 5) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: controllingVariable is empty or too vague.",
          },
        ],
        isError: true,
      };
    }

    const cvLower = cv.toLowerCase();
    if (
      cvLower.includes("whether") ||
      cvLower.startsWith("if ") ||
      cvLower.includes("hope that") ||
      cvLower.includes("market condition")
    ) {
      return {
        content: [
          {
            type: "text",
            text: `REJECTED: Controlling variable looks like an outcome/hope/whether-statement.\nVariable: "${cv}"\n\nIt must be a rate, volume, or action you can change directly. Rewrite until the manipulability test passes.`,
          },
        ],
        isError: true,
      };
    }

    if (!proof || proof.length < 10) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: manipulabilityProof must state the concrete action you can take this afternoon.",
          },
        ],
        isError: true,
      };
    }

    state.diagnostic = {
      realityMap: realityMap.trim(),
      controllingVariable: cv,
      manipulabilityConfirmed: true,
      killLog: killLog.map((k) => ({
        option: k.option,
        constraint: k.constraintFailed,
        killed: k.killed,
      })),
      completed: true,
    };

    clearFromNeedleDown();

    const killedCount = killLog.filter((k) => k.killed).length;
    const survived = killLog.filter((k) => !k.killed).map((k) => k.option);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Diagnostic package complete",
              controllingVariable: cv,
              manipulabilityConfirmed: true,
              hardConstraints,
              killSummary: {
                totalOptions: killLog.length,
                killed: killedCount,
                survived,
              },
              next: "Call set_needle_metric (single causal metric tied to victory + controlling variable).",
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
  "Lock the single needle metric causally linked to both the Victory Condition and the Controlling Variable. Everything else is noise.",
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

    if (!metric?.trim() || !target?.trim() || !verificationMethod?.trim()) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: metric, target, and verificationMethod are all required.",
          },
        ],
        isError: true,
      };
    }

    state.needle = {
      metric: metric.trim(),
      target: target.trim(),
      verificationMethod: verificationMethod.trim(),
    };
    state.bet = undefined;
    state.decision = undefined;
    state.verification = undefined;
    state.lastAction = undefined;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Needle metric locked",
              needle: state.needle,
              next: "Call propose_irreversible_bet before locking any decision.",
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
  "Record a small irreversible bet that produces real information. Prefer smaller than fear says. Required before lock_decision.",
  {
    bet: z.string().describe("Description of the small irreversible bet"),
    expectedNeedleMovement: z
      .string()
      .describe("How the needle is expected to move"),
    rollbackCondition: z
      .string()
      .describe("Clear condition under which we roll back"),
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

    if (
      !bet?.trim() ||
      !expectedNeedleMovement?.trim() ||
      !rollbackCondition?.trim() ||
      !timeBox?.trim()
    ) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: bet, expectedNeedleMovement, rollbackCondition, and timeBox are all required.",
          },
        ],
        isError: true,
      };
    }

    state.bet = {
      bet: bet.trim(),
      expectedNeedleMovement: expectedNeedleMovement.trim(),
      rollbackCondition: rollbackCondition.trim(),
      timeBox: timeBox.trim(),
      recorded: true,
    };
    state.decision = undefined;
    state.verification = undefined;
    state.lastAction = undefined;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Bet recorded",
              bet: state.bet,
              next: "After the bet runs, call lock_decision once the cut is clear.",
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
  "Make the cut once. Requires a recorded bet. Protects the decision from casual reopening.",
  {
    decisionStatement: z
      .string()
      .describe("Clear statement of the locked decision"),
    protectionMechanism: z
      .string()
      .describe(
        "How casual reopening is prevented (written authorization, owner, etc.)"
      ),
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

    if (!state.bet?.recorded) {
      return {
        content: [
          {
            type: "text",
            text: "HARD GATE: propose_irreversible_bet must be recorded before lock_decision. Do not skip the bet.",
          },
        ],
        isError: true,
      };
    }

    if (!decisionStatement?.trim() || !protectionMechanism?.trim()) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: decisionStatement and protectionMechanism are required.",
          },
        ],
        isError: true,
      };
    }

    state.decision = {
      statement: decisionStatement.trim(),
      locked: true,
    };
    state.verification = undefined;
    state.lastAction = undefined;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Decision locked",
              decision: state.decision,
              protection: protectionMechanism.trim(),
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
    measuredResult: z
      .string()
      .describe("Actual measured result against the needle"),
    victoryMet: z
      .boolean()
      .describe("Whether the Victory Condition is now met"),
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

    if (!measuredResult?.trim() || !evidence?.trim()) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: measuredResult and evidence are required.",
          },
        ],
        isError: true,
      };
    }

    state.verification = {
      result: victoryMet ? "met" : "not_met",
      evidence: evidence.trim(),
    };
    state.lastAction = undefined;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: victoryMet
                ? "Victory condition MET"
                : "Victory condition NOT MET",
              measuredResult: measuredResult.trim(),
              evidence: evidence.trim(),
              next: victoryMet
                ? "Call rollback_or_double_down with action=double_down, then codify_lesson."
                : "Call rollback_or_double_down with action=rollback. Diagnostic/needle/decision will be cleared as stale.",
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
  "Forced binary response to verification. Failure → rollback (clears diagnostic and below as stale). Success → double_down, then codify.",
  {
    action: z
      .enum(["rollback", "double_down"])
      .describe("The only two legal actions"),
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
            text: `INCONSISTENT: Verification was "${state.verification.result}" but action was "${action}". Protocol requires rollback on failure and double_down on success.`,
          },
        ],
        isError: true,
      };
    }

    if (!nextAction?.trim()) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: nextAction is required (concrete immediate step).",
          },
        ],
        isError: true,
      };
    }

    state.lastAction = action;

    if (action === "rollback") {
      clearFromDiagnosticDown();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "Action taken: rollback",
                nextAction: nextAction.trim(),
                stateCleared:
                  "diagnostic, needle, bet, decision, verification cleared as stale",
                next: "Return to run_diagnostic_loop (victory remains locked unless you redefine it).",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "Action taken: double_down",
              nextAction: nextAction.trim(),
              next: "Call codify_lesson so the learning is written into the system.",
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
  "Write the paid-for lesson into system memory. Requires successful verification and double_down. A lesson only in one head will be relearned at full price.",
  {
    lesson: z.string().describe("One-sentence paid-for lesson"),
    systemLocation: z
      .string()
      .describe("Where in the system the lesson now lives"),
    controlMechanism: z
      .string()
      .describe("Control that catches drift without the original person"),
    recurrencePathKilled: z
      .string()
      .describe("How the old failure path is now blocked"),
  },
  async ({
    lesson,
    systemLocation,
    controlMechanism,
    recurrencePathKilled,
  }) => {
    if (state.verification?.result !== "met") {
      return {
        content: [
          {
            type: "text",
            text: "HARD GATE: codify_lesson requires verification result = met. Complete verify_cut successfully first.",
          },
        ],
        isError: true,
      };
    }

    if (state.lastAction !== "double_down") {
      return {
        content: [
          {
            type: "text",
            text: "HARD GATE: call rollback_or_double_down with double_down before codify_lesson.",
          },
        ],
        isError: true,
      };
    }

    if (
      !lesson?.trim() ||
      !systemLocation?.trim() ||
      !controlMechanism?.trim() ||
      !recurrencePathKilled?.trim()
    ) {
      return {
        content: [
          {
            type: "text",
            text: "REJECTED: lesson, systemLocation, controlMechanism, and recurrencePathKilled are all required.",
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
              status: "Lesson codified",
              lesson: lesson.trim(),
              systemLocation: systemLocation.trim(),
              controlMechanism: controlMechanism.trim(),
              recurrencePathKilled: recurrencePathKilled.trim(),
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
              controllingVariable:
                state.diagnostic?.controllingVariable ?? null,
              needleSet: !!state.needle,
              betRecorded: !!state.bet?.recorded,
              decisionLocked: !!state.decision?.locked,
              verification: state.verification?.result ?? null,
              lastAction: state.lastAction ?? null,
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
