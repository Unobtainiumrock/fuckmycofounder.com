"use client";

import { useEffect } from "react";

import { initializeCookedQuiz } from "./initialize-cooked-quiz";

export function CookedQuizClient(): null {
  useEffect(() => initializeCookedQuiz(), []);
  return null;
}
