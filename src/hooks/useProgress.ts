import { useState, useEffect } from 'react';
import { UserProgress, ScenarioResult } from '@/types';

const STORAGE_KEY = 'prompt-skills-progress';

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        parsed.startedAt = new Date(parsed.startedAt);
        parsed.completedScenarios = parsed.completedScenarios.map((result: any) => ({
          ...result,
          completedAt: new Date(result.completedAt)
        }));
        setProgress(parsed);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = (newProgress: UserProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const initializeProgress = (userName: string) => {
    const newProgress: UserProgress = {
      userId: `user_${Date.now()}`,
      userName,
      startedAt: new Date(),
      completedScenarios: [],
      currentScenario: 0,
      isCompleted: false,
      totalScore: 0,
      averageScore: 0
    };
    saveProgress(newProgress);
    return newProgress;
  };

  const updateScenarioResult = (result: ScenarioResult) => {
    if (!progress) return;

    const updatedScenarios = [...progress.completedScenarios];
    const existingIndex = updatedScenarios.findIndex(s => s.scenarioId === result.scenarioId);
    
    if (existingIndex >= 0) {
      updatedScenarios[existingIndex] = result;
    } else {
      updatedScenarios.push(result);
    }

    const totalScore = updatedScenarios.reduce((sum, scenario) => sum + scenario.finalScore, 0);
    const averageScore = updatedScenarios.length > 0 ? Math.round(totalScore / updatedScenarios.length) : 0;

    const updatedProgress: UserProgress = {
      ...progress,
      completedScenarios: updatedScenarios,
      totalScore,
      averageScore,
      currentScenario: Math.max(progress.currentScenario, result.scenarioId)
    };

    saveProgress(updatedProgress);
  };

  const markCompleted = () => {
    if (!progress) return;
    
    const updatedProgress: UserProgress = {
      ...progress,
      isCompleted: true
    };
    
    saveProgress(updatedProgress);
  };

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(null);
  };

  const getScenarioResult = (scenarioId: number): ScenarioResult | undefined => {
    return progress?.completedScenarios.find(result => result.scenarioId === scenarioId);
  };

  const getCompletionPercentage = (totalScenarios: number): number => {
    if (!progress) return 0;
    return Math.round((progress.completedScenarios.length / totalScenarios) * 100);
  };

  const getSkillLevel = (): "Grundkenntnisse" | "Kompetent" | "Experte" => {
    if (!progress || progress.completedScenarios.length === 0) return "Grundkenntnisse";
    
    if (progress.averageScore >= 80) return "Experte";
    if (progress.averageScore >= 65) return "Kompetent";
    return "Grundkenntnisse";
  };

  const setCurrentScenario = (scenarioId: number) => {
    if (!progress) return;
    
    const updatedProgress: UserProgress = {
      ...progress,
      currentScenario: scenarioId
    };
    
    saveProgress(updatedProgress);
  };

  const getScenarioStatus = (scenarioId: number): "new" | "partial" | "completed" => {
    if (!progress) return "new";
    
    const result = progress.completedScenarios.find(s => s.scenarioId === scenarioId);
    if (result) return "completed";
    if (scenarioId <= progress.currentScenario) return "partial";
    return "new";
  };

  return {
    progress,
    isLoading,
    initializeProgress,
    updateScenarioResult,
    markCompleted,
    resetProgress,
    getScenarioResult,
    getCompletionPercentage,
    getSkillLevel,
    setCurrentScenario,
    getScenarioStatus
  };
}