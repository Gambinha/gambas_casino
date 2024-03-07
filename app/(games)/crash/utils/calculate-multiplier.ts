export const CaculateMultiplierByTime = (seconds: number): number => {
  return Number(0.006 * seconds * seconds + 0.002 * seconds + 1);
};
