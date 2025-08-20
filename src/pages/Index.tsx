import { useState } from "react";
import { Hero } from "@/components/Hero";
import { QuizInterface } from "@/components/QuizInterface";

const Index = () => {
  const [showQuiz, setShowQuiz] = useState(false);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleBackToHome = () => {
    setShowQuiz(false);
  };

  return (
    <div>
      {showQuiz ? (
        <QuizInterface onBack={handleBackToHome} />
      ) : (
        <Hero onStartQuiz={handleStartQuiz} />
      )}
    </div>
  );
};

export default Index;