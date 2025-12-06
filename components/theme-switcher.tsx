"use client";

import { Button } from "@heroui/button";
import {useTheme} from "next-themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  },[])

  if (!mounted) return null

  return (
    <Button
        color="primary"
        variant="light"
        radius="full"
        size="sm"
        isIconOnly
        onPress={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} size="lg" className="text-foreground"/>
    </Button>
  )
};