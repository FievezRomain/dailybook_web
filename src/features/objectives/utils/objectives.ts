import type { Objective } from "@/features/objectives/types/objective";

function localDateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function isObjectiveCompleted(objective: Objective) {
  return objective.sousetapes.length > 0 && objective.sousetapes.every((step) => step.state === true);
}

export function isObjectiveInProgress(objective: Objective, today = new Date()) {
  const hasRemainingStep = objective.sousetapes.some((step) => step.state === false);
  const endDate = objective.datefin?.slice(0, 10);
  return hasRemainingStep && (!endDate || endDate >= localDateKey(today));
}

export function isObjectiveExpired(objective: Objective, today = new Date()) {
  const endDate = objective.datefin?.slice(0, 10);
  return Boolean(
    objective.sousetapes.some((step) => step.state === false) &&
    endDate &&
    endDate < localDateKey(today),
  );
}

export const filterInProgress = (goals: Objective[], today = new Date()) =>
  goals.filter((objective) => isObjectiveInProgress(objective, today));
