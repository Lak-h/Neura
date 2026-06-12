import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY);

async function main() {
  console.log("🌱 Seeding Neuraxis demo environment…");

  // ── Users ──
  const password = await bcrypt.hash("password123", 10);
  const [olivia, marcus, priya, devon] = await Promise.all([
    prisma.user.upsert({
      where: { email: "olivia@acme.dev" },
      update: {},
      create: { email: "olivia@acme.dev", name: "Olivia Chen", passwordHash: password, emailVerified: daysAgo(90), presence: "online" },
    }),
    prisma.user.upsert({
      where: { email: "marcus@acme.dev" },
      update: {},
      create: { email: "marcus@acme.dev", name: "Marcus Webb", passwordHash: password, emailVerified: daysAgo(80), presence: "away" },
    }),
    prisma.user.upsert({
      where: { email: "priya@acme.dev" },
      update: {},
      create: { email: "priya@acme.dev", name: "Priya Sharma", passwordHash: password, emailVerified: daysAgo(60) },
    }),
    prisma.user.upsert({
      where: { email: "devon@acme.dev" },
      update: {},
      create: { email: "devon@acme.dev", name: "Devon Riley", passwordHash: password, emailVerified: daysAgo(30) },
    }),
  ]);

  // ── Organisation ──
  const org = await prisma.organisation.upsert({
    where: { slug: "acme-robotics" },
    update: {},
    create: {
      name: "Acme Robotics",
      slug: "acme-robotics",
      plan: "growth",
      aiCredits: 87_420,
      members: {
        create: [
          { userId: olivia.id, role: "owner" },
          { userId: marcus.id, role: "admin" },
          { userId: priya.id, role: "member" },
          { userId: devon.id, role: "viewer" },
        ],
      },
      subscription: {
        create: {
          stripeCustomerId: "cus_demo_acme",
          plan: "growth",
          status: "trialing",
          trialEndsAt: daysFromNow(9),
          currentPeriodEnd: daysFromNow(9),
        },
      },
    },
  });

  // ── Teams ──
  await prisma.team.createMany({
    data: [
      { orgId: org.id, name: "Revenue", description: "Sales + marketing ops" },
      { orgId: org.id, name: "Support", description: "Customer experience" },
    ],
  });
  const teams = await prisma.team.findMany({ where: { orgId: org.id } });
  await prisma.teamMember.createMany({
    data: [
      { teamId: teams[0].id, userId: olivia.id, role: "lead" },
      { teamId: teams[0].id, userId: priya.id, role: "member" },
      { teamId: teams[1].id, userId: marcus.id, role: "lead" },
      { teamId: teams[1].id, userId: devon.id, role: "member" },
    ],
  });

  // ── Agents ──
  const sdr = await prisma.aIAgent.create({
    data: {
      orgId: org.id,
      name: "Atlas — SDR Qualifier",
      description: "Qualifies inbound leads against ICP and books meetings.",
      systemPrompt:
        "You are Atlas, Acme Robotics' sales development agent. Qualify inbound leads using BANT. Acme sells warehouse automation robots to mid-market logistics companies (50–5,000 employees). Be direct, warm, and concise. Always end qualified conversations by proposing two meeting slots.",
      model: "claude-sonnet-4-6",
      temperature: 0.5,
      persona: "formal",
      status: "active",
      toolsJson: JSON.stringify(["crm_lookup", "calendar_check", "email_send"]),
      versions: {
        create: [
          { version: 1, snapshot: "{}", changelog: "Initial configuration" },
          { version: 2, snapshot: "{}", changelog: "Tightened ICP criteria, added calendar tool" },
        ],
      },
      deployments: {
        create: [
          { channel: "widget", config: JSON.stringify({ theme: "dark", position: "bottom-right" }) },
          { channel: "slack", config: JSON.stringify({ channel: "#inbound-leads" }) },
        ],
      },
    },
  });

  const triage = await prisma.aIAgent.create({
    data: {
      orgId: org.id,
      name: "Mercury — Support Triage",
      description: "First-line support: answers from the KB, escalates when unsure.",
      systemPrompt:
        "You are Mercury, the support triage agent for Acme Robotics. Answer questions using the knowledge base. If confidence is low or the issue involves hardware safety, escalate to a human immediately. Tone: empathetic, plain language.",
      model: "claude-haiku-4-5",
      temperature: 0.3,
      persona: "empathetic",
      status: "active",
      confidenceThreshold: 0.7,
      toolsJson: JSON.stringify(["kb_search", "ticket_create"]),
      versions: { create: [{ version: 1, snapshot: "{}", changelog: "Initial configuration" }] },
      deployments: { create: [{ channel: "email", config: JSON.stringify({ inbox: "support@acme.dev" }) }] },
    },
  });

  const analyst = await prisma.aIAgent.create({
    data: {
      orgId: org.id,
      name: "Vega — Research Analyst",
      description: "Deep-dive competitive and market research on demand.",
      systemPrompt:
        "You are Vega, a research analyst agent. Produce structured competitive briefs with sources. Format: Executive summary, key findings (bulleted), risks, recommended actions.",
      model: "claude-opus-4-7",
      temperature: 0.7,
      persona: "technical",
      status: "draft",
      toolsJson: JSON.stringify(["web_search"]),
      versions: { create: [{ version: 1, snapshot: "{}", changelog: "Initial configuration" }] },
    },
  });

  // Agent analytics — 14 days of data per active agent
  for (const agent of [sdr, triage]) {
    await prisma.agentAnalytics.createMany({
      data: Array.from({ length: 14 }, (_, i) => ({
        agentId: agent.id,
        date: daysAgo(13 - i),
        messagesSent: 40 + Math.floor(Math.random() * 120),
        conversationCount: 8 + Math.floor(Math.random() * 25),
        avgResponseMs: 900 + Math.floor(Math.random() * 1400),
        satisfactionScore: 3.8 + Math.random() * 1.1,
        errorCount: Math.floor(Math.random() * 3),
        creditsUsed: 200 + Math.floor(Math.random() * 600),
      })),
    });
  }

  // ── Workflow: lead qualification pipeline ──
  const wf = await prisma.workflow.create({
    data: {
      orgId: org.id,
      name: "Inbound Lead Qualification",
      description: "Webhook → AI classify → branch on score → CRM + Slack.",
      status: "active",
      triggerType: "webhook",
    },
  });
  const nodes = await Promise.all([
    prisma.workflowNode.create({ data: { workflowId: wf.id, type: "trigger", subtype: "webhook", label: "Lead form submitted", positionX: 0, positionY: 120 } }),
    prisma.workflowNode.create({ data: { workflowId: wf.id, type: "ai", subtype: "classify_intent", label: "Score lead vs ICP", config: JSON.stringify({ agentId: sdr.id }), positionX: 260, positionY: 120 } }),
    prisma.workflowNode.create({ data: { workflowId: wf.id, type: "condition", subtype: "if_else", label: "Score ≥ 70?", positionX: 520, positionY: 120 } }),
    prisma.workflowNode.create({ data: { workflowId: wf.id, type: "action", subtype: "http_request", label: "Create CRM opportunity", positionX: 780, positionY: 40 } }),
    prisma.workflowNode.create({ data: { workflowId: wf.id, type: "action", subtype: "send_email", label: "Send nurture sequence", positionX: 780, positionY: 200 } }),
  ]);
  await prisma.workflowEdge.createMany({
    data: [
      { workflowId: wf.id, sourceNodeId: nodes[0].id, targetNodeId: nodes[1].id },
      { workflowId: wf.id, sourceNodeId: nodes[1].id, targetNodeId: nodes[2].id },
      { workflowId: wf.id, sourceNodeId: nodes[2].id, targetNodeId: nodes[3].id, branchLabel: "true" },
      { workflowId: wf.id, sourceNodeId: nodes[2].id, targetNodeId: nodes[4].id, branchLabel: "false" },
    ],
  });
  // Runs + logs
  for (let i = 0; i < 6; i++) {
    const failed = i === 4;
    const run = await prisma.workflowRun.create({
      data: {
        workflowId: wf.id,
        status: failed ? "failed" : "success",
        triggeredBy: "webhook",
        inputJson: JSON.stringify({ email: `lead${i}@example.com`, company: `Prospect ${i} Inc` }),
        outputJson: failed ? undefined : JSON.stringify({ score: 55 + i * 8, routed: i % 2 === 0 ? "crm" : "nurture" }),
        error: failed ? "HTTP 502 from CRM endpoint (retries exhausted)" : undefined,
        startedAt: daysAgo(6 - i),
        finishedAt: new Date(daysAgo(6 - i).getTime() + 4200),
      },
    });
    await prisma.workflowRunLog.createMany({
      data: [
        { runId: run.id, nodeId: nodes[0].id, level: "info", message: "Webhook received", durationMs: 12 },
        { runId: run.id, nodeId: nodes[1].id, level: "info", message: "Lead scored", outputJson: JSON.stringify({ score: 55 + i * 8 }), durationMs: 2100 },
        failed
          ? { runId: run.id, nodeId: nodes[3].id, level: "error", message: "HTTP 502 from CRM endpoint", durationMs: 2050 }
          : { runId: run.id, nodeId: nodes[2].id, level: "info", message: "Branch evaluated", durationMs: 3 },
      ],
    });
  }

  // ── Knowledge base ──
  const kb = await prisma.knowledgeBase.create({
    data: {
      orgId: org.id,
      name: "Product & Support",
      description: "Everything agents need to answer customer questions.",
      agents: { connect: [{ id: triage.id }] },
    },
  });
  const rootDoc = await prisma.kBDocument.create({
    data: { kbId: kb.id, title: "AcmeBot X1 — Operations Manual", sourceType: "editor", content: "The AcmeBot X1 is a warehouse automation robot with a 250kg payload, 8-hour battery, and LiDAR navigation. Charging takes 90 minutes on the X-Dock." },
  });
  await prisma.kBDocument.createMany({
    data: [
      { kbId: kb.id, parentId: rootDoc.id, title: "Troubleshooting: Navigation Errors", sourceType: "editor", content: "E-204 means LiDAR occlusion. Clean the sensor window. E-310 indicates map drift — re-run floor calibration from the dock." },
      { kbId: kb.id, parentId: rootDoc.id, title: "Safety Procedures", sourceType: "editor", content: "Emergency stop is the red button on the rear panel. Always power down before inspecting the drive train. Hardware safety issues must be escalated to a human technician." },
      { kbId: kb.id, title: "Pricing & SLA Policy", sourceType: "editor", content: "Standard SLA is next-business-day response. Premium SLA (4-hour) is available on Scale contracts. Hardware warranty covers 24 months." },
    ],
  });
  const docs = await prisma.kBDocument.findMany({ where: { kbId: kb.id } });
  for (const d of docs) {
    await prisma.kBChunk.create({
      data: { documentId: d.id, index: 0, text: d.content.slice(0, 500), tokenCount: Math.ceil(d.content.length / 4) },
    });
  }

  // ── Conversation tags ──
  await prisma.conversationTag.createMany({
    data: [
      { orgId: org.id, name: "billing", color: "#f59e0b" },
      { orgId: org.id, name: "hardware", color: "#ef4444" },
      { orgId: org.id, name: "qualified-lead", color: "#10b981" },
      { orgId: org.id, name: "feature-request", color: "#6366f1" },
    ],
  });
  const tags = await prisma.conversationTag.findMany({ where: { orgId: org.id } });

  // ── Conversations ──
  const conv1 = await prisma.conversation.create({
    data: {
      orgId: org.id,
      agentId: triage.id,
      channel: "widget",
      subject: "X1 throwing E-204 after firmware update",
      status: "open",
      priority: "high",
      sentiment: "negative",
      needsHumanReview: true,
      externalCustomerEmail: "ops@northwind-logistics.com",
      slaDueAt: daysFromNow(0.5),
      summary: "Customer's X1 fleet shows E-204 post-update. Agent suggested sensor cleaning; customer says issue persists across 6 units. Likely needs engineering escalation.",
      tags: { connect: [{ id: tags.find((t) => t.name === "hardware")!.id }] },
      messages: {
        create: [
          { role: "user", content: "All six of our X1 units started throwing E-204 right after the 4.2 firmware update. This is blocking our night shift." },
          { role: "assistant", content: "I'm sorry — that sounds disruptive. E-204 usually indicates LiDAR occlusion. Could you try cleaning the sensor window on one unit and let me know if the error clears?", confidence: 0.74, latencyMs: 1240, creditsUsed: 2 },
          { role: "user", content: "Already tried that on two units. Error comes back within minutes. This started exactly when 4.2 installed." },
          { role: "assistant", content: "Understood — six units failing immediately after a firmware update points to something beyond sensor cleaning. I'm escalating this to our engineering team now with your fleet details. You'll hear from a human technician within your 4-hour SLA window.", confidence: 0.52, latencyMs: 1810, creditsUsed: 2 },
        ],
      },
    },
  });
  await prisma.conversation.create({
    data: {
      orgId: org.id,
      agentId: sdr.id,
      channel: "widget",
      subject: "Interested in automating our Dallas warehouse",
      status: "resolved",
      priority: "normal",
      sentiment: "positive",
      csatScore: 5,
      externalCustomerEmail: "j.patel@swiftship.com",
      summary: "Qualified lead: SwiftShip, 1,200 employees, Dallas DC, budget approved Q3, decision maker engaged. Meeting booked.",
      tags: { connect: [{ id: tags.find((t) => t.name === "qualified-lead")!.id }] },
      messages: {
        create: [
          { role: "user", content: "Hi — we run a 400,000 sq ft distribution center in Dallas and are evaluating automation vendors for Q3." },
          { role: "assistant", content: "Great fit to explore — Acme specialises in mid-market distribution automation. Quick questions: roughly how many SKUs do you move daily, and is budget already approved for Q3?", confidence: 0.91, latencyMs: 980, creditsUsed: 6 },
          { role: "user", content: "About 50k picks/day. Budget approved, $2-3M range. I lead ops and own the decision with our CFO." },
          { role: "assistant", content: "That's squarely our sweet spot. I'd love to get you a tailored ROI model. I have Tuesday 10am CT or Wednesday 2pm CT open with our solutions team — which works better?", confidence: 0.95, latencyMs: 1100, creditsUsed: 6 },
        ],
      },
    },
  });
  // internal note on conv1
  await prisma.message.create({
    data: { conversationId: conv1.id, role: "internal_note", content: "Eng confirmed: 4.2 firmware has a LiDAR driver regression. Hotfix 4.2.1 ships tomorrow. — Marcus", authorId: marcus.id },
  });

  // ── Billing history ──
  await prisma.creditTransaction.createMany({
    data: [
      { orgId: org.id, delta: 100_000, reason: "subscription_grant", balanceAfter: 100_000, createdAt: daysAgo(14) },
      { orgId: org.id, delta: -8_400, reason: "agent_usage", balanceAfter: 91_600, createdAt: daysAgo(10) },
      { orgId: org.id, delta: -3_180, reason: "agent_usage", balanceAfter: 88_420, createdAt: daysAgo(5) },
      { orgId: org.id, delta: -1_000, reason: "workflow_usage", balanceAfter: 87_420, createdAt: daysAgo(2) },
    ],
  });

  // ── Integrations ──
  await prisma.integration.createMany({
    data: [
      { orgId: org.id, provider: "slack", status: "connected", lastSyncAt: daysAgo(0.04), config: JSON.stringify({ workspace: "acme-robotics" }) },
      { orgId: org.id, provider: "hubspot", status: "connected", lastSyncAt: daysAgo(0.2), config: JSON.stringify({ portalId: "demo" }) },
      { orgId: org.id, provider: "gmail", status: "error", errorCount: 3, lastSyncAt: daysAgo(1.5), config: "{}" },
    ],
  });

  // ── Notifications, audit, API key ──
  await prisma.notification.createMany({
    data: [
      { userId: olivia.id, orgId: org.id, kind: "agent", title: "Mercury escalated a conversation", body: "Northwind Logistics — E-204 fleet issue needs human review.", href: "/inbox" },
      { userId: olivia.id, orgId: org.id, kind: "billing", title: "Trial ends in 9 days", body: "Your Growth trial converts on the 20th. Add a payment method to avoid interruption.", href: "/billing" },
      { userId: marcus.id, orgId: org.id, kind: "mention", title: "Olivia mentioned you", body: "“@marcus can you own the 4.2 hotfix comms?”", href: "/inbox" },
    ],
  });
  await prisma.auditLog.createMany({
    data: [
      { orgId: org.id, userId: olivia.id, action: "org.create", targetType: "organisation", targetId: org.id, createdAt: daysAgo(90) },
      { orgId: org.id, userId: olivia.id, action: "agent.create", targetType: "agent", targetId: sdr.id, createdAt: daysAgo(45) },
      { orgId: org.id, userId: marcus.id, action: "agent.update", targetType: "agent", targetId: triage.id, createdAt: daysAgo(12) },
      { orgId: org.id, userId: olivia.id, action: "member.invite", targetType: "invite", createdAt: daysAgo(30) },
    ],
  });
  await prisma.aPIKey.create({
    data: {
      orgId: org.id,
      name: "Production API",
      hashedKey: "seeded-demo-hash-not-a-real-key",
      keyPrefix: "nrx_live_demo",
      lastUsedAt: daysAgo(1),
    },
  });

  // ── Marketing content ──
  await prisma.blogPost.createMany({
    data: [
      {
        slug: "introducing-neuraxis",
        title: "Introducing Neuraxis: The AI Operating System for Modern Businesses",
        excerpt: "Why we built an AI-native operations brain for mid-market companies.",
        contentMdx: "# Introducing Neuraxis\n\nEvery mid-market company is drowning in tools and starving for leverage. Neuraxis unifies agents, workflows, and knowledge into one operating system…",
        authorName: "Neuraxis Team",
        publishedAt: daysAgo(21),
      },
      {
        slug: "agents-that-know-when-to-stop",
        title: "Agents That Know When to Stop: Confidence Thresholds in Production",
        excerpt: "Human-in-the-loop isn't a checkbox — it's an architecture.",
        contentMdx: "# Agents That Know When to Stop\n\nThe most dangerous agent is a confidently wrong one. Here's how confidence-gated escalation works in Neuraxis…",
        authorName: "Neuraxis Team",
        publishedAt: daysAgo(7),
      },
    ],
  });
  await prisma.changelog.createMany({
    data: [
      { version: "1.2.0", title: "Workflow marketplace + Slack deployments", contentMdx: "- Publish workflows to the marketplace\n- One-click Slack agent deployment\n- 40% faster KB embeddings", publishedAt: daysAgo(10) },
      { version: "1.1.0", title: "Agent versioning & rollback", contentMdx: "- Snapshot every agent config change\n- One-click rollback\n- Side-by-side playground comparison", publishedAt: daysAgo(30) },
    ],
  });
  await prisma.waitlistEntry.createMany({
    data: [
      { email: "cto@meridianfreight.com", company: "Meridian Freight", source: "landing_page" },
      { email: "ops@bluepeakhealth.io", company: "BluePeak Health", source: "referral" },
    ],
  });

  console.log("✅ Seed complete:");
  console.log(`   Org:    ${org.name} (${org.slug}) — Growth trial, 87,420 credits`);
  console.log(`   Users:  olivia@acme.dev / marcus@ / priya@ / devon@  (password: password123)`);
  console.log(`   Agents: Atlas (SDR), Mercury (Support), Vega (Research)`);
  console.log(`   Plus:   1 workflow + 6 runs, KB with 4 docs, 2 conversations, billing ledger`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
