"use client";

import { Button } from "@heroui/button";
import {useTheme} from "next-themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
        color="primary"
        variant="light"
        radius="full"
        size="sm"
        isIconOnly
        onPress={() => setTheme(theme === "light" ? "dark" : "light")}>
        <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} size="lg" />
    </Button>
  )
};