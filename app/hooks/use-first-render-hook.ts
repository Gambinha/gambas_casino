import { useRef } from "react";

export const useFirstRender = (): boolean => {
  const ref = useRef(true);
  const firstRender = ref.current;
  ref.current = false;
  return firstRender;
};
