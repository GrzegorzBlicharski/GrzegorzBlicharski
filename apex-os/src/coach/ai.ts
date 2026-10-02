/**
 * Optional AI extension points. The core never calls these — every number stays reproducible without AI.
 * An implementation may only *produce events* (e.g. GERMAN_WRITING_EVALUATED with source "ai"), which then flow
 * through the normal validation → projection → metrics pipeline.
 */
import type { NewEvent } from "@/events/catalog";
import type { Insight } from "./insights";

export interface Summarizer {
  /** Turn structured insights into prose; must not add facts that are not in the input. */
  summarize(insights: Insight[]): Promise<string>;
}

export interface WritingEvaluator {
  /** Evaluate a German text and return a GERMAN_WRITING_EVALUATED event (source "ai"). */
  evaluate(text: string, day: string): Promise<NewEvent>;
}

export interface Classifier {
  /** Suggest a domain/activity for a free-text note or imported item. Suggestions require user confirmation. */
  classify(text: string): Promise<{ domain: string; activity: string; confidence: number }>;
}

export interface AiProviders {
  summarizer?: Summarizer;
  writingEvaluator?: WritingEvaluator;
  classifier?: Classifier;
}

/** No providers are configured by default: APEX OS sends nothing anywhere unless explicitly set up. */
export const aiProviders: AiProviders = {};
