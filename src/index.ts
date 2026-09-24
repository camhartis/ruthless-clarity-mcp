#!/usr/bin/env node
/**
 * Ruthless Clarity MCP Server v0.1.2
 * Decision-discipline harness based on the Ruthless Clarity protocol.
 *
 * Gate sequence:
 *   define_victory
 *   → run_diagnostic_loop          (atomic Ch 2+3+4; permanent kill log)
 *   → set_needle_metric            (requires causalLink)
 *   → propose_irreversible_bet     (plan)
 *   → record_bet_result            (information from the bet — required before lock)
 *   → lock_decision
 *   → verify_cut
 *   → rollback_or_double_down
 *   → codify_lesson                (only after met + double_down)
 *
 * Protocol fidelity notes (v0.1.2):
 * - Lock requires bet RESULTS, not only a proposal (Ch 6 → Ch 7 order)
 * - Killed options stay dead for the session unless rejustified
 * - Ch 1 requires unknowns + ifNotMet
 * - Needle requires explicit causal link to victory + controlling variable
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Session state (in-memory, session-scoped only)
// ---------------------------------------------------------------------------

interface KillRecord {
  option: string;
  optionKey: string;
  constraint: string;
}

interface ProtocolState {
  victory?: {
    condition: string;
    verificationMethod: string;
    grandmotherTest: string;
    unknownsOrRisks: string;
    ifNotMet: string;
    locked: boolean;
  };
  diagnostic?: {
    realityMap: string;
    controllingVariable: string;
    symptom: string;
    causalJustification: string;
    manipulabilityConfirmed: boolean;
    killLog: Array<{ option: string; constraint: string; killed: boolean }>;
    completed: boolean;
  };
  /** Survives diagnostic refresh and rollback — session permanent kill discipline */
  permanentKillLog: KillRecord[];
  needle?: {
    metric: string;
    target: string;
    verificationMethod: string;
    causalLink: string;
  };
  bet?: {
    bet: string;
    expectedNeedleMovement: string;
    rollbackCondition: string;
    timeBox: string;
    proposed: boolean;
    result?: {
      measuredNeedleMovement: string;
      outcome: string;
      informationGained: string;
      recorded: boolean;
    };
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

const state: ProtocolState = {
  permanentKillLog: [],
};

function normalizeOptionKey(option: string): string {
  return option.trim().toLowerCase().replace(/\s+/g, " ");
}

function clearFromDiagnosticDown(): void {
  state.diagnostic = undefined;
  state.needle = undefined;
  state.bet = undefined;
  state.decision = undefined;
  state.verification = undefined;
  state.lastAction = undefined;
  // permanentKillLog intentionally retained
}

function clearFromNeedleDown(): void {
  state.needle = undefined;
  state.bet = undefined;
  state.decision = undefined;
  state.verification = undefined;
  state.lastAction = undefined;
}

function err(text: string) {
  return {
    content: [{ type: "text" as const, text }],
    isError: true,
  };
}

function ok(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "ruthless-clarity-mcp",
  version: "0.1.2",
});

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

server.tool(
  "define_victory",
  "Lock a verifiable Victory Condition (Chapter 1). Must be a state, not an action or feeling. Passes the grandmother test. Requires unknowns and what you will do if not met. Calling again resets diagnostic and below (permanent kill log is kept).",
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
      .describe(
        "Key unknowns, assumptions, or risks — include owners and resolution intent where known"
      ),
    ifNotMet: z
      .string()
      .describe(
        "What will be done if the victory condition is not met"
      ),
  },
  async ({
    condition,
    verificationMethod,
    grandmotherTest,
    unknownsOrRisks,
    ifNotMet,
  }) => {
    if (!condition || condition.trim().length < 10) {
      return err(
        "REJECTED: Victory condition is too vague or empty. It must be a specific, verifiable state (not an action or feeling)."
      );
    }
    if (!verificationMethod || verificationMethod.trim().length < 5) {
      return err(
        "REJECTED: verificationMethod is required. State the objective check that proves the victory condition."
      );
    }
    if (!grandmotherTest || grandmotherTest.trim().length < 5) {
      return err(
        "REJECTED: grandmotherTest is required. Plain language a non-expert can use to judge win/lose."
      );
    }
    if (!unknownsOrRisks || unknownsOrRisks.trim().length < 5) {
      return err(
        "REJECTED: unknownsOrRisks is required. Name key unknowns, assumptions, or risks (with owners/resolution intent when known)."
      );
    }
    if (!ifNotMet || ifNotMet.trim().length < 5) {
      return err(
        "REJECTED: ifNotMet is required. State what you will do if the victory condition is not met."
      );
    }

    state.victory = {
      condition: condition.trim(),
      verificationMethod: verificationMethod.trim(),
      grandmotherTest: grandmotherTest.trim(),
      unknownsOrRisks: unknownsOrRisks.trim(),
      ifNotMet: ifNotMet.trim(),
      locked: true,
    };

    clearFromDiagnosticDown();

    return ok({
      status: "Victory locked",
      victory: state.victory,
      next: "Call run_diagnostic_loop with reality map + controlling variable + kill log as one atomic package.",
    });
  }
);

server.tool(
  "run_diagnostic_loop",
  "Commit the atomic diagnostic package (Chapters 2+3+4). Conceptually parallel; one operational commit. Previously killed options in this session stay dead unless rejustification is provided when marking them survived.",
  {
    realityMap: z
      .string()
      .describe(
        "Structured reality map: segments (3-7), real handoffs with owners, undocumented workarounds, approval gates, variable inventory"
      ),
    symptom: z
      .string()
      .describe("What is actually observed (symptom statement)"),
    controllingVariable: z
      .string()
      .describe(
        "The single rate, volume, or action we can directly change that has the highest causal impact on the Victory Condition. Not an outcome or 'whether'."
      ),
    manipulabilityProof: z
      .string()
      .describe(
        "Concrete proof we can change this variable this afternoon without external permission or luck"
      ),
    causalJustification: z
      .string()
      .describe(
        "Why changing this one controlling variable moves the Victory Condition"
      ),
    hardConstraints: z
      .array(z.string())
      .describe(
        "Named hard constraints used to kill options. At least one required."
      ),
    killLog: z
      .array(
        z.object({
          option: z.string(),
          constraintFailed: z
            .string()
            .describe(
              "Constraint that killed it, or 'survived' if not killed"
            ),
          killed: z.boolean(),
          rejustification: z
            .string()
            .optional()
            .describe(
              "Required if this option was previously killed in this session and is now marked survived"
            ),
        })
      )
      .describe(
        "Every option considered. At least one row required. Empty logs are rejected."
      ),
  },
  async ({
    realityMap,
    symptom,
    controllingVariable,
    manipulabilityProof,
    causalJustification,
    hardConstraints,
    killLog,
  }) => {
    if (!state.victory?.locked) {
      return err(
        "HARD GATE: define_victory must be called and locked before run_diagnostic_loop."
      );
    }
    if (!realityMap || realityMap.trim().length < 20) {
      return err(
        "REJECTED: realityMap is too thin. Include segments, handoffs/owners, workarounds, and variable inventory."
      );
    }
    if (!symptom || symptom.trim().length < 5) {
      return err("REJECTED: symptom is required (what is actually observed).");
    }
    if (!hardConstraints || hardConstraints.length < 1) {
      return err(
        "REJECTED: hardConstraints must list at least one named constraint before options are evaluated."
      );
    }
    if (!killLog || killLog.length < 1) {
      return err(
        "REJECTED: killLog cannot be empty. Record every option considered and the first constraint that killed it (or 'survived')."
      );
    }
    if (!causalJustification || causalJustification.trim().length < 10) {
      return err(
        "REJECTED: causalJustification is required. Explain why changing the controlling variable moves the Victory Condition."
      );
    }

    const cv = controllingVariable.trim();
    const proof = manipulabilityProof.trim();

    if (!cv || cv.length < 5) {
      return err("REJECTED: controllingVariable is empty or too vague.");
    }

    const cvLower = cv.toLowerCase();
    if (
      cvLower.includes("whether") ||
      cvLower.startsWith("if ") ||
      cvLower.includes("hope that") ||
      cvLower.includes("market condition")
    ) {
      return err(
        `REJECTED: Controlling variable looks like an outcome/hope/whether-statement.\nVariable: "${cv}"\n\nIt must be a rate, volume, or action you can change directly. Rewrite until the manipulability test passes.`
      );
    }

    if (!proof || proof.length < 10) {
      return err(
        "REJECTED: manipulabilityProof must state the concrete action you can take this afternoon."
      );
    }

    // Permanent kill discipline: cannot revive a prior kill without rejustification
    const priorKeys = new Map(
      state.permanentKillLog.map((k) => [k.optionKey, k])
    );
    for (const row of killLog) {
      if (row.killed) continue;
      const key = normalizeOptionKey(row.option);
      const prior = priorKeys.get(key);
      if (prior) {
        const rej = row.rejustification?.trim() ?? "";
        if (rej.length < 15) {
          return err(
            `HARD GATE: Option "${row.option}" was previously killed in this session (constraint: "${prior.constraint}"). To mark it survived you must supply rejustification (≥15 chars) with new evidence. Killed options stay dead unless fully re-justified.`
          );
        }
      }
    }

    state.diagnostic = {
      realityMap: realityMap.trim(),
      controllingVariable: cv,
      symptom: symptom.trim(),
      causalJustification: causalJustification.trim(),
      manipulabilityConfirmed: true,
      killLog: killLog.map((k) => ({
        option: k.option,
        constraint: k.constraintFailed,
        killed: k.killed,
      })),
      completed: true,
    };

    // Append newly killed options to permanent session log
    for (const row of killLog) {
      if (!row.killed) continue;
      const key = normalizeOptionKey(row.option);
      if (!priorKeys.has(key)) {
        state.permanentKillLog.push({
          option: row.option.trim(),
          optionKey: key,
          constraint: row.constraintFailed.trim(),
        });
        priorKeys.set(key, state.permanentKillLog[state.permanentKillLog.length - 1]);
      }
    }

    clearFromNeedleDown();

    const killedCount = killLog.filter((k) => k.killed).length;
    const survived = killLog.filter((k) => !k.killed).map((k) => k.option);

    return ok({
      status: "Diagnostic package complete",
      controllingVariable: cv,
      symptom: symptom.trim(),
      manipulabilityConfirmed: true,
      hardConstraints,
      killSummary: {
        totalOptions: killLog.length,
        killed: killedCount,
        survived,
        sessionPermanentKills: state.permanentKillLog.length,
      },
      next: "Call set_needle_metric (single causal metric tied to victory + controlling variable).",
    });
  }
);

server.tool(
  "set_needle_metric",
  "Lock the single needle metric causally linked to both the Victory Condition and the Controlling Variable. Everything else is noise.",
  {
    metric: z.string().describe("The single causal metric"),
    target: z.string().describe("Target value or band"),
    verificationMethod: z.string().describe("How the metric will be measured"),
    causalLink: z
      .string()
      .describe(
        "How this metric moves only if the controlling variable and victory condition move — not a vanity metric"
      ),
  },
  async ({ metric, target, verificationMethod, causalLink }) => {
    if (!state.diagnostic?.completed) {
      return err(
        "HARD GATE: run_diagnostic_loop must complete before set_needle_metric."
      );
    }
    if (
      !metric?.trim() ||
      !target?.trim() ||
      !verificationMethod?.trim() ||
      !causalLink?.trim()
    ) {
      return err(
        "REJECTED: metric, target, verificationMethod, and causalLink are all required."
      );
    }
    if (causalLink.trim().length < 15) {
      return err(
        "REJECTED: causalLink is too thin. Explain how this metric is causally tied to the controlling variable and victory."
      );
    }

    state.needle = {
      metric: metric.trim(),
      target: target.trim(),
      verificationMethod: verificationMethod.trim(),
      causalLink: causalLink.trim(),
    };
    state.bet = undefined;
    state.decision = undefined;
    state.verification = undefined;
    state.lastAction = undefined;

    return ok({
      status: "Needle metric locked",
      needle: state.needle,
      next: "Call propose_irreversible_bet (plan the small bet). After it runs, call record_bet_result before lock_decision.",
    });
  }
);

server.tool(
  "propose_irreversible_bet",
  "Propose a small irreversible bet (Chapter 6 plan). Prefer smaller than fear says. Does NOT unlock lock_decision — you must record results after the bet runs.",
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
      return err("HARD GATE: set_needle_metric must be called first.");
    }
    if (
      !bet?.trim() ||
      !expectedNeedleMovement?.trim() ||
      !rollbackCondition?.trim() ||
      !timeBox?.trim()
    ) {
      return err(
        "REJECTED: bet, expectedNeedleMovement, rollbackCondition, and timeBox are all required."
      );
    }

    state.bet = {
      bet: bet.trim(),
      expectedNeedleMovement: expectedNeedleMovement.trim(),
      rollbackCondition: rollbackCondition.trim(),
      timeBox: timeBox.trim(),
      proposed: true,
      result: undefined,
    };
    state.decision = undefined;
    state.verification = undefined;
    state.lastAction = undefined;

    return ok({
      status: "Bet proposed",
      bet: {
        bet: state.bet.bet,
        expectedNeedleMovement: state.bet.expectedNeedleMovement,
        rollbackCondition: state.bet.rollbackCondition,
        timeBox: state.bet.timeBox,
      },
      next: "Run the bet outside the protocol tools. Then call record_bet_result with measured movement and information gained. lock_decision requires results.",
    });
  }
);

server.tool(
  "record_bet_result",
  "Record the results of the irreversible bet (Chapter 6 outcome). Required before lock_decision. Protocol: lock only after the bet has produced information.",
  {
    measuredNeedleMovement: z
      .string()
      .describe("What the needle actually did"),
    outcome: z
      .string()
      .describe("What happened — facts, not interpretation"),
    informationGained: z
      .string()
      .describe(
        "What real information this bet produced that we did not have before"
      ),
  },
  async ({ measuredNeedleMovement, outcome, informationGained }) => {
    if (!state.bet?.proposed) {
      return err(
        "HARD GATE: propose_irreversible_bet must be called before record_bet_result."
      );
    }
    if (
      !measuredNeedleMovement?.trim() ||
      !outcome?.trim() ||
      !informationGained?.trim()
    ) {
      return err(
        "REJECTED: measuredNeedleMovement, outcome, and informationGained are all required."
      );
    }
    if (informationGained.trim().length < 10) {
      return err(
        "REJECTED: informationGained is too thin. State what you now know that you did not know before the bet."
      );
    }

    state.bet.result = {
      measuredNeedleMovement: measuredNeedleMovement.trim(),
      outcome: outcome.trim(),
      informationGained: informationGained.trim(),
      recorded: true,
    };
    state.decision = undefined;
    state.verification = undefined;
    state.lastAction = undefined;

    return ok({
      status: "Bet result recorded",
      result: state.bet.result,
      next: "Call lock_decision to make the cut once, using the information the bet produced.",
    });
  }
);

server.tool(
  "lock_decision",
  "Make the cut once (Chapter 7). Requires recorded bet RESULTS (not only a proposal). Protects the decision from casual reopening.",
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
      return err(
        "HARD GATE: diagnostic and needle must exist before locking a decision."
      );
    }
    if (!state.bet?.proposed) {
      return err(
        "HARD GATE: propose_irreversible_bet must be called before lock_decision."
      );
    }
    if (!state.bet?.result?.recorded) {
      return err(
        "HARD GATE: record_bet_result must be called before lock_decision. Protocol requires bet results (information) before locking the cut — not only a proposal."
      );
    }
    if (!decisionStatement?.trim() || !protectionMechanism?.trim()) {
      return err(
        "REJECTED: decisionStatement and protectionMechanism are required."
      );
    }

    state.decision = {
      statement: decisionStatement.trim(),
      locked: true,
    };
    state.verification = undefined;
    state.lastAction = undefined;

    return ok({
      status: "Decision locked",
      decision: state.decision,
      protection: protectionMechanism.trim(),
      basedOnBetResult: state.bet.result,
      next: "After implementation of the locked cut, call verify_cut against the needle metric.",
    });
  }
);

server.tool(
  "verify_cut",
  "Verify the cut against the needle metric (Chapter 8). Do not celebrate until the metric has moved as required.",
  {
    measuredResult: z
      .string()
      .describe("Actual measured result against the needle"),
    targetComparison: z
      .string()
      .describe(
        "Explicit comparison: needle target was X, measured Y (forces honest check)"
      ),
    victoryMet: z
      .boolean()
      .describe("Whether the Victory Condition is now met"),
    evidence: z.string().describe("Evidence trail"),
  },
  async ({ measuredResult, targetComparison, victoryMet, evidence }) => {
    if (!state.decision?.locked || !state.needle) {
      return err(
        "HARD GATE: a locked decision and needle metric are required before verification."
      );
    }
    if (
      !measuredResult?.trim() ||
      !targetComparison?.trim() ||
      !evidence?.trim()
    ) {
      return err(
        "REJECTED: measuredResult, targetComparison, and evidence are all required."
      );
    }

    state.verification = {
      result: victoryMet ? "met" : "not_met",
      evidence: evidence.trim(),
    };
    state.lastAction = undefined;

    return ok({
      status: victoryMet
        ? "Victory condition MET"
        : "Victory condition NOT MET",
      measuredResult: measuredResult.trim(),
      targetComparison: targetComparison.trim(),
      needle: state.needle,
      evidence: evidence.trim(),
      next: victoryMet
        ? "Call rollback_or_double_down with action=double_down, then codify_lesson."
        : "Call rollback_or_double_down with action=rollback. Diagnostic/needle/decision will be cleared as stale; permanent kill log is kept.",
    });
  }
);

server.tool(
  "rollback_or_double_down",
  "Forced binary response to verification (Chapter 9). Failure → rollback (clears diagnostic and below; permanent kills kept). Success → double_down, then codify.",
  {
    action: z
      .enum(["rollback", "double_down"])
      .describe("The only two legal actions"),
    nextAction: z.string().describe("Immediate concrete next action"),
  },
  async ({ action, nextAction }) => {
    if (!state.verification) {
      return err("HARD GATE: verify_cut must be called first.");
    }

    const consistent =
      (state.verification.result === "met" && action === "double_down") ||
      (state.verification.result === "not_met" && action === "rollback");

    if (!consistent) {
      return err(
        `INCONSISTENT: Verification was "${state.verification.result}" but action was "${action}". Protocol requires rollback on failure and double_down on success.`
      );
    }

    if (!nextAction?.trim()) {
      return err(
        "REJECTED: nextAction is required (concrete immediate step)."
      );
    }

    state.lastAction = action;

    if (action === "rollback") {
      clearFromDiagnosticDown();
      return ok({
        status: "Action taken: rollback",
        nextAction: nextAction.trim(),
        stateCleared:
          "diagnostic, needle, bet, decision, verification cleared as stale",
        permanentKillLogRetained: state.permanentKillLog.length,
        next: "Return to run_diagnostic_loop (victory remains locked unless you redefine it). Previously killed options still require rejustification.",
      });
    }

    return ok({
      status: "Action taken: double_down",
      nextAction: nextAction.trim(),
      next: "Call codify_lesson so the learning is written into the system.",
    });
  }
);

server.tool(
  "codify_lesson",
  "Write the paid-for lesson into system memory (Chapter 10). Requires verification=met and double_down.",
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
      return err(
        "HARD GATE: codify_lesson requires verification result = met. Complete verify_cut successfully first."
      );
    }
    if (state.lastAction !== "double_down") {
      return err(
        "HARD GATE: call rollback_or_double_down with double_down before codify_lesson."
      );
    }
    if (
      !lesson?.trim() ||
      !systemLocation?.trim() ||
      !controlMechanism?.trim() ||
      !recurrencePathKilled?.trim()
    ) {
      return err(
        "REJECTED: lesson, systemLocation, controlMechanism, and recurrencePathKilled are all required."
      );
    }

    return ok({
      status: "Lesson codified",
      lesson: lesson.trim(),
      systemLocation: systemLocation.trim(),
      controlMechanism: controlMechanism.trim(),
      recurrencePathKilled: recurrencePathKilled.trim(),
      note: "A lesson that lives only in one head will be relearned at full price. Chapters 11–12 (Teach / Live) remain human and system responsibilities beyond this server.",
    });
  }
);

server.tool(
  "get_protocol_status",
  "Return which Protocol gates have been satisfied in the current session.",
  {},
  async () => {
    return ok({
      victoryLocked: !!state.victory?.locked,
      diagnosticComplete: !!state.diagnostic?.completed,
      controllingVariable: state.diagnostic?.controllingVariable ?? null,
      sessionPermanentKills: state.permanentKillLog.length,
      needleSet: !!state.needle,
      betProposed: !!state.bet?.proposed,
      betResultRecorded: !!state.bet?.result?.recorded,
      decisionLocked: !!state.decision?.locked,
      verification: state.verification?.result ?? null,
      lastAction: state.lastAction ?? null,
    });
  }
);

server.tool(
  "export_artifacts",
  "Export the structured Protocol artifacts produced so far in this session.",
  {},
  async () => {
    return ok(state);
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Ruthless Clarity MCP server v0.1.2 running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
