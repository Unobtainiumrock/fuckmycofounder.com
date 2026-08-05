"use client";

import { useEffect } from "react";

import { initializeCookedQuiz } from "./initialize-cooked-quiz";

export function CookedQuizClient() {
  useEffect(() => initializeCookedQuiz(), []);
  return null;
}
