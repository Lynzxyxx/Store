"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeCtx = { theme: "light" | "dark"; toggle: () => void };
const Ctx = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });

export function useTheme() {
  return useContext(Ctx);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("ryuu-theme")) as
      | "light"
      | "dark"
      | null;
    const initial =
      saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("ryuu-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}
