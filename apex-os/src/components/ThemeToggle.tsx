"use client";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>("system");
  useEffect(() => {
    try {
      setTheme(localStorage.getItem("apex-theme") ?? "system");
    } catch {}
  }, []);
  const cycle = () => {
    const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("apex-theme", next);
    } catch {}
    if (next === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", next);
  };
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <button className="btn btn-sm btn-ghost" onClick={cycle} title={`Theme: ${theme} (click to change)`} aria-label="Change theme">
      <Icon size={17} />
    </button>
  );
}

export const THEME_SCRIPT = `try{var t=localStorage.getItem('apex-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;
