"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "./ui/card";
import FeatureCardModal from "./FeatureCardModal";
import { Activity, Heart, Brain } from "lucide-react";

type Feature = {
  id: string;
  title: string;
  description: string;
  details: string;
  icon: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    id: "risk-prediction",
    title: "Risk Prediction",
    description: "Advanced ML models analyze your health data for risk assessment.",
    details:
      "Our models combine clinical risk factors, lifestyle data, and user inputs to provide a personalized diabetes risk score, with guidance on next steps.",
    icon: <Activity className="w-10 h-10 text-blue-600" />,
  },
  {
    id: "lifestyle-recommendations",
    title: "Lifestyle Recommendations",
    description: "Personalized diet and exercise suggestions to reduce risk.",
    details:
      "Receive tailored recommendations for diet, physical activity, and sleep hygiene based on your profile, with flexible goals and tracking.",
    icon: <Heart className="w-10 h-10 text-green-600" />,
  },
  {
    id: "explainable-ai",
    title: "Explainable AI",
    description: "Understand why the model made a prediction.",
    details:
      "We surface the most influential factors contributing to your risk and provide human-readable explanations and visualizations.",
    icon: <Brain className="w-10 h-10 text-purple-600" />,
  },
];

export function FeatureCards() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center">
      <div className="pointer-events-auto max-w-6xl w-full px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {FEATURES.map((f) => (
            <Card key={f.id} className="p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1">
              <div>
                <CardHeader className="flex items-start gap-4">
                  <div className="flex-shrink-0">{f.icon}</div>
                  <div>
                    <CardTitle className="text-lg font-semibold">{f.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">{f.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="mt-4 text-sm text-muted-foreground">{f.description}</CardContent>
              </div>

              <CardFooter>
                <CardAction>
                  <button
                    onClick={() => setExpandedId(f.id)}
                    className="learn-more-link text-sm text-blue-600 hover:underline"
                    aria-expanded={expandedId === f.id}
                    aria-controls={`feature-details-${f.id}`}
                  >
                    Learn more
                  </button>
                </CardAction>
              </CardFooter>

              <FeatureCardModal
                open={expandedId === f.id}
                onOpenChange={(open) => {
                  if (!open) setExpandedId(null);
                }}
                title={f.title}
                subtitle={f.description}
              >
                <p id={`feature-details-${f.id}`} className="text-sm text-gray-700">
                  {f.details}
                </p>
              </FeatureCardModal>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeatureCards;
