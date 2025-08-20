import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Lightbulb, Target } from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  description: string;
  context: string;
  goal: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  idealPrompt: string;
  hints: string[];
  evaluation: {
    criteria: string[];
    sampleGoodPrompt: string;
    commonMistakes: string[];
  };
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Customer Support Email Response",
    description: "Generate a professional response to an angry customer complaint",
    context: "A customer received a damaged product and is demanding a full refund. They've been waiting 3 days for a response and are threatening to leave negative reviews.",
    goal: "Create a prompt that generates an empathetic, solution-focused response that retains the customer",
    difficulty: "Beginner",
    category: "Customer Service",
    idealPrompt: "Write a professional, empathetic customer service email responding to an angry customer who received a damaged product. The tone should be apologetic but solution-focused. Include: 1) Sincere apology, 2) Immediate action plan (replacement/refund), 3) Timeline for resolution, 4) Additional gesture of goodwill. Keep it concise but warm.",
    hints: [
      "Specify the tone (empathetic, professional)",
      "Include specific elements to address",
      "Mention the customer's emotional state",
      "Ask for a solution-focused approach"
    ],
    evaluation: {
      criteria: [
        "Specifies empathetic tone",
        "Mentions the specific situation (damaged product)",
        "Requests solution-focused approach",
        "Clear structure or elements to include"
      ],
      sampleGoodPrompt: "Write a professional, empathetic customer service email responding to an angry customer who received a damaged product...",
      commonMistakes: [
        "Too vague - doesn't specify tone",
        "Doesn't mention the context",
        "No clear structure requested"
      ]
    }
  },
  {
    id: 2,
    title: "Product Launch Strategy",
    description: "Create a comprehensive go-to-market strategy for a new SaaS product",
    context: "Your startup is launching an AI-powered project management tool targeting remote teams. Budget is limited, and you need to focus on the most effective channels.",
    goal: "Generate a detailed launch strategy with specific tactics, timelines, and budget allocation",
    difficulty: "Advanced",
    category: "Marketing",
    idealPrompt: "Create a comprehensive 90-day go-to-market strategy for launching an AI-powered project management SaaS targeting remote teams. Include: 1) Target audience analysis, 2) Positioning strategy, 3) Marketing channels with budget allocation, 4) Content marketing plan, 5) Partnership opportunities, 6) Success metrics and KPIs. Assume a $50K marketing budget and focus on cost-effective channels for startups.",
    hints: [
      "Specify the time frame (90 days)",
      "Include budget constraints",
      "Request specific deliverables",
      "Mention target audience details",
      "Ask for measurable outcomes"
    ],
    evaluation: {
      criteria: [
        "Specifies time frame",
        "Includes budget constraints",
        "Requests specific strategy components",
        "Mentions target audience",
        "Asks for measurable metrics"
      ],
      sampleGoodPrompt: "Create a comprehensive 90-day go-to-market strategy for launching an AI-powered project management SaaS...",
      commonMistakes: [
        "Too broad - no specific timeframe",
        "Doesn't mention budget constraints",
        "Lacks specific deliverables",
        "No target audience details"
      ]
    }
  },
  {
    id: 3,
    title: "Code Review Process",
    description: "Design a code review checklist for a development team",
    context: "Your team of 8 developers has been having issues with code quality and deployment bugs. Reviews are inconsistent and sometimes skip important aspects.",
    goal: "Create a systematic code review process that catches bugs early and maintains code quality",
    difficulty: "Intermediate",
    category: "Development",
    idealPrompt: "Create a comprehensive code review checklist for a team of 8 developers to improve code quality and reduce deployment bugs. Include: 1) Pre-review automated checks, 2) Manual review criteria (functionality, security, performance), 3) Review assignment process, 4) Approval workflow, 5) Documentation requirements. Focus on practical, actionable items that can be implemented immediately.",
    hints: [
      "Specify team size context",
      "Include both automated and manual elements",
      "Focus on practical implementation",
      "Address the specific problems mentioned"
    ],
    evaluation: {
      criteria: [
        "Mentions team context/size",
        "Includes both automated and manual checks",
        "Addresses specific problems (bugs, consistency)",
        "Requests actionable, implementable items",
        "Covers the full review process"
      ],
      sampleGoodPrompt: "Create a comprehensive code review checklist for a team of 8 developers to improve code quality...",
      commonMistakes: [
        "Generic checklist without context",
        "Doesn't address specific problems",
        "Too theoretical, not actionable"
      ]
    }
  }
];

interface QuizInterfaceProps {
  onBack: () => void;
}

export function QuizInterface({ onBack }: QuizInterfaceProps) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [userPrompt, setUserPrompt] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const scenario = scenarios[currentScenario];
  const progress = ((currentScenario + 1) / scenarios.length) * 100;

  const evaluatePrompt = () => {
    const criteria = scenario.evaluation.criteria;
    let matchedCriteria = 0;
    
    // Simple evaluation based on keyword matching and structure
    criteria.forEach(criterion => {
      if (criterion.toLowerCase().includes("tone") || criterion.toLowerCase().includes("empathetic")) {
        if (userPrompt.toLowerCase().includes("empathetic") || userPrompt.toLowerCase().includes("professional") || userPrompt.toLowerCase().includes("tone")) {
          matchedCriteria++;
        }
      } else if (criterion.toLowerCase().includes("specific") || criterion.toLowerCase().includes("context")) {
        if (userPrompt.toLowerCase().includes("damaged") || userPrompt.toLowerCase().includes("product") || userPrompt.toLowerCase().includes("customer")) {
          matchedCriteria++;
        }
      } else if (criterion.toLowerCase().includes("structure") || criterion.toLowerCase().includes("include")) {
        if (userPrompt.includes("1)") || userPrompt.includes("-") || userPrompt.includes("•")) {
          matchedCriteria++;
        }
      } else if (criterion.toLowerCase().includes("solution") || criterion.toLowerCase().includes("approach")) {
        if (userPrompt.toLowerCase().includes("solution") || userPrompt.toLowerCase().includes("resolve") || userPrompt.toLowerCase().includes("fix")) {
          matchedCriteria++;
        }
      } else if (criterion.toLowerCase().includes("time") || criterion.toLowerCase().includes("budget")) {
        if (userPrompt.toLowerCase().includes("90") || userPrompt.toLowerCase().includes("budget") || userPrompt.toLowerCase().includes("$")) {
          matchedCriteria++;
        }
      }
    });

    const currentScore = Math.round((matchedCriteria / criteria.length) * 100);
    setScore(currentScore);
    setShowFeedback(true);
  };

  const nextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setUserPrompt("");
      setShowFeedback(false);
      setShowHints(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-success text-white";
      case "Intermediate": return "bg-warning text-white";
      case "Advanced": return "bg-destructive text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-accent-soft"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Scenario {currentScenario + 1} of {scenarios.length}
            </p>
            <Progress value={progress} className="w-32" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Scenario Panel */}
            <div className="space-y-6">
              <Card className="bg-gradient-card border-0 shadow-card">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className={getDifficultyColor(scenario.difficulty)}>
                      {scenario.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-accent">
                      {scenario.category}
                    </Badge>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">{scenario.title}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-accent" />
                        Scenario
                      </h3>
                      <p className="text-muted-foreground">{scenario.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Context</h3>
                      <p className="text-muted-foreground text-sm bg-accent-soft p-3 rounded-lg">
                        {scenario.context}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Your Goal</h3>
                      <p className="text-accent">{scenario.goal}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Hints */}
              <Card className="bg-gradient-card border-0 shadow-card">
                <div className="p-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-2 mb-4 hover:bg-accent-soft"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {showHints ? "Hide Hints" : "Show Hints"}
                  </Button>
                  
                  {showHints && (
                    <div className="space-y-2">
                      {scenario.hints.map((hint, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-accent">•</span>
                          {hint}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Prompt Input Panel */}
            <div className="space-y-6">
              <Card className="bg-gradient-card border-0 shadow-card">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Write Your Prompt</h3>
                  
                  <Textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Write your prompt here... Be specific, clear, and consider the context provided."
                    className="min-h-48 bg-background/50 border-accent-soft resize-none"
                    disabled={showFeedback}
                  />
                  
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      {userPrompt.length} characters
                    </p>
                    
                    {!showFeedback ? (
                      <Button
                        onClick={evaluatePrompt}
                        disabled={userPrompt.trim().length < 20}
                        className="bg-gradient-accent hover:bg-gradient-accent/90 text-accent-foreground shadow-button"
                      >
                        Evaluate Prompt
                      </Button>
                    ) : (
                      <Button
                        onClick={nextScenario}
                        className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-button"
                        disabled={currentScenario >= scenarios.length - 1}
                      >
                        Next Scenario
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Feedback */}
              {showFeedback && (
                <Card className="bg-gradient-card border-0 shadow-card animate-slide-up">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      {score >= 70 ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : (
                        <X className="h-5 w-5 text-destructive" />
                      )}
                      Your Score: {score}%
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Evaluation Criteria</h4>
                        <div className="space-y-2">
                          {scenario.evaluation.criteria.map((criterion, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-success mt-0.5" />
                              {criterion}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Sample Good Prompt</h4>
                        <p className="text-sm text-muted-foreground bg-accent-soft p-3 rounded-lg">
                          {scenario.evaluation.sampleGoodPrompt}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}