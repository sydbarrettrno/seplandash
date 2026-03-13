import React, { createContext, useContext, useState, ReactNode } from "react";
import type { AppConfig } from "./types";

const defaultConfig: AppConfig = {
  slaDias: 30,
  anoInicioGestao: 2025,
};

interface ConfigContextType {
  config: AppConfig;
  setConfig: (c: AppConfig) => void;
}

const ConfigContext = createContext<ConfigContextType>({
  config: defaultConfig,
  setConfig: () => {},
});

export const useAppConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
