"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppTutorial from "@/components/app-tutorial";

export default function TutorialPage() {
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(true);

  const handleClose = () => {
    setShowTutorial(false);
    router.push("/dashboard");
  };

  if (!showTutorial) {
    return null;
  }

  return <AppTutorial onClose={handleClose} />;
}
