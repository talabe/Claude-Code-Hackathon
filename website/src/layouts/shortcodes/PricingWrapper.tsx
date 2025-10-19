import React from "react";
import PricingCard from "./PricingCard";

const PricingWrapper = ({
  title,
  subtitle,
  description,
  plans,
  note,
}: {
  title: string;
  subtitle: string;
  description: string;
  plans: Array<{
    name: string;
    price: string;
    period: string;
    features: string[];
    button: {
      label: string;
      link: string;
    };
  }>;
  note?: string;
}) => {
  // Safety check for plans
  if (!plans || !Array.isArray(plans) || plans.length === 0) {
    return null;
  }

  // Determine which plan should be highlighted (e.g., the "Free" plan or check for "Pro" as fallback)
  const highlightedIndex = plans.findIndex(
    (plan) =>
      plan.name.toLowerCase().includes("free") ||
      plan.name.toLowerCase().includes("starter"),
  );

  // If no Free/Starter found, fall back to Pro/Premium/Business
  const finalHighlightedIndex =
    highlightedIndex !== -1
      ? highlightedIndex
      : plans.findIndex(
          (plan) =>
            plan.name.toLowerCase().includes("pro") ||
            plan.name.toLowerCase().includes("premium") ||
            plan.name.toLowerCase().includes("business"),
        );

  return (
    <section className="section">
      <div className="container">
        {/* Header Section */}
        <div className="row justify-center mb-16">
          <div className="md:col-8 lg:col-7 text-center">
            <h1 className="text-h1-sm mb-4 text-text-dark md:text-h1-md lg:text-h1">
              {title}
            </h1>
            <p className="text-h5 font-medium text-secondary mb-4">
              {subtitle}
            </p>
            <p className="text-h6 text-text">{description}</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="row gy-6 justify-center mb-12">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              {...plan}
              isHighlighted={index === finalHighlightedIndex}
            />
          ))}
        </div>

        {/* Note Section */}
        {note && (
          <div className="row justify-center">
            <div className="md:col-8 lg:col-6 text-center">
              <div className="rounded-lg border border-border/30 bg-light p-6 sm:p-8">
                <p className="text-text font-secondary">
                  <span className="font-medium text-text-dark">💡 </span>
                  {note}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingWrapper;
