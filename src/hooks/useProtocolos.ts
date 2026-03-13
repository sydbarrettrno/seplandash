import { useMemo } from "react";
import { useAppConfig } from "@/lib/config";
import { generateMockData } from "@/lib/mockData";
import type { Protocolo } from "@/lib/types";

let cachedData: Protocolo[] | null = null;
let cachedKey = "";

export function useProtocolos() {
  const { config } = useAppConfig();
  const key = `${config.slaDias}-${config.anoInicioGestao}`;

  return useMemo(() => {
    if (cachedKey !== key) {
      cachedData = generateMockData(config.slaDias, config.anoInicioGestao);
      cachedKey = key;
    }
    return cachedData!;
  }, [key, config.slaDias, config.anoInicioGestao]);
}
