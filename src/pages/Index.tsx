import { useState } from "react";
import { Hero } from "@/components/Hero";
import { QuizInterface } from "@/components/QuizInterface";
import { Dashboard } from "@/components/Dashboard";
import { useProgress } from "@/hooks/useProgress";
import { governmentScenarios } from "@/data/governmentScenarios";

type AppState = "hero" | "quiz" | "dashboard";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("hero");
  const [userName, setUserName] = useState("");
  const { progress, initializeProgress, resetProgress } = useProgress();

  const handleStartQuiz = (name: string) => {
    setUserName(name);
    initializeProgress(name);
    setAppState("quiz");
  };

  const handleViewDashboard = () => {
    setAppState("dashboard");
  };

  const handleBackToHome = () => {
    setAppState("hero");
  };

  const handleStartNewSession = () => {
    resetProgress();
    setAppState("hero");
  };

  return (
    <div>
      {appState === "hero" && (
        <Hero 
          onStartQuiz={handleStartQuiz}
          hasExistingProgress={!!progress}
          onViewDashboard={handleViewDashboard}
        />
      )}
      {appState === "quiz" && (
        <QuizInterface 
          onBack={handleBackToHome}
          scenarios={governmentScenarios}
        />
      )}
      {appState === "dashboard" && progress && (
        <Dashboard
          progress={progress}
          totalScenarios={governmentScenarios.length}
          onStartNewSession={handleStartNewSession}
          onBackToQuiz={() => setAppState("quiz")}
        />
      )}
    </div>
  );
};

export default Index;