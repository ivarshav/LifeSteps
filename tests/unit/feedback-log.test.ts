import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildClarityEvent,
  getFeedbackLogConfig,
  logTaskClarity,
  sendClarityEvent,
} from "@/lib/feedbackLog";

const INGEST_URL =
  "https://us-east-1.aws.edge.axiom.co/v1/ingest/lifesteps_feedback";

function stubConfigured() {
  vi.stubEnv("NEXT_PUBLIC_AXIOM_INGEST_URL", INGEST_URL);
  vi.stubEnv("NEXT_PUBLIC_AXIOM_TOKEN", "xaat-test");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("buildClarityEvent", () => {
  it("builds a minimal anonymous clarity event", () => {
    const event = buildClarityEvent({
      appVersion: "abc123",
      stepId: "rent-apartment",
      taskId: "sign-contract",
      value: "not-helpful",
    });

    expect(event).toMatchObject({
      appVersion: "abc123",
      event: "step_clarity",
      stepId: "rent-apartment",
      taskId: "sign-contract",
      value: "not-helpful",
    });
    expect(Number.isNaN(Date.parse(event.ts))).toBe(false);
  });

  it("defaults the app version to null", () => {
    expect(
      buildClarityEvent({ stepId: "a", taskId: "b", value: "helpful" })
        .appVersion,
    ).toBeNull();
  });
});

describe("getFeedbackLogConfig", () => {
  it("returns null without configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_AXIOM_INGEST_URL", "");
    vi.stubEnv("NEXT_PUBLIC_AXIOM_TOKEN", "");
    expect(getFeedbackLogConfig()).toBeNull();
  });

  it("accepts an Axiom https endpoint with a token", () => {
    stubConfigured();
    expect(getFeedbackLogConfig()).toEqual({
      token: "xaat-test",
      url: INGEST_URL,
    });
  });

  it.each([
    "http://us-east-1.aws.edge.axiom.co/v1/ingest/lifesteps_feedback",
    "https://evil.example/v1/ingest/lifesteps_feedback",
    "https://axiom.co.evil.example/v1/ingest/lifesteps_feedback",
    "https://notaxiom.co/v1/ingest/lifesteps_feedback",
  ])("rejects an unsafe endpoint: %s", (url) => {
    vi.stubEnv("NEXT_PUBLIC_AXIOM_INGEST_URL", url);
    vi.stubEnv("NEXT_PUBLIC_AXIOM_TOKEN", "xaat-test");
    expect(getFeedbackLogConfig()).toBeNull();
  });
});

describe("sendClarityEvent", () => {
  it("does nothing when unconfigured", () => {
    vi.stubEnv("NEXT_PUBLIC_AXIOM_INGEST_URL", "");
    vi.stubEnv("NEXT_PUBLIC_AXIOM_TOKEN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    sendClarityEvent(
      buildClarityEvent({ stepId: "a", taskId: "b", value: "helpful" }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the event to Axiom with a bearer token", () => {
    stubConfigured();
    const fetchMock = vi.fn().mockResolvedValue({ status: 202 } as Response);
    vi.stubGlobal("fetch", fetchMock);

    sendClarityEvent(
      buildClarityEvent({ stepId: "a", taskId: "b", value: "helpful" }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(INGEST_URL);
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
    expect(init.headers).toMatchObject({
      Authorization: "Bearer xaat-test",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(init.body))).toEqual([
      expect.objectContaining({
        event: "step_clarity",
        stepId: "a",
        taskId: "b",
        value: "helpful",
      }),
    ]);
  });
});

describe("logTaskClarity", () => {
  it("forwards to the configured sink", () => {
    stubConfigured();
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "sha-1");
    const fetchMock = vi.fn().mockResolvedValue({ status: 202 } as Response);
    vi.stubGlobal("fetch", fetchMock);

    logTaskClarity({ stepId: "a", taskId: "b", value: "not-helpful" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))[0]).toMatchObject({
      appVersion: "sha-1",
      value: "not-helpful",
    });
  });
});
