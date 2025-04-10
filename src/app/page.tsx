"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "../../utils/registerSW";

import HomePage from "./HomePage/HomePage";

export default function Page() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <main>
      <HomePage />
    </main>
  );
}
