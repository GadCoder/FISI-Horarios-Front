"use client";

import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { FaSun, FaRegMoon } from "react-icons/fa6";
import { Dispatch, SetStateAction } from "react";

type setPageTheme = Dispatch<SetStateAction<string>>;

function ThemeToggle({
  initialValue,
  setPageTheme,
}: {
  initialValue: string;
  setPageTheme: setPageTheme;
}) {
  const [theme, setTheme] = useState(initialValue);

  useEffect(() => {
    if (theme) {
      document.cookie = `theme=${theme};path=/;`;
      document.querySelector("html")?.setAttribute("data-bs-theme", theme);
      setPageTheme(theme);
    } else {
      setTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    }
  }, [theme]);

  return (
    <Form.Check // prettier-ignore
      type="switch"
      id="custom-switch"
      label={theme == "dark" ? <FaSun /> : <FaRegMoon />}
      onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
    />
  );
}

export default ThemeToggle;
