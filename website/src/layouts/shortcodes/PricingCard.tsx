import React from "react";

const PricingCard = ({
  name,
  price,
  period,
  features,
  button,
  tag,
  isHighlighted,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  button: {
    label: string;
    link: string;
  };
  tag?: string;
  isHighlighted?: boolean;
}) => {
  const isDisabled =
    !button.link ||
    button.link === "#" ||
    (button.label && button.label.toLowerCase().includes("coming soon"));
  return (
    <div className="flex xl:col-6">
      <div
        className={`flex flex-col w-full rounded-xl border px-7 py-7 sm:rounded-2xl transition-all duration-300 ${
          isHighlighted
            ? "border-secondary bg-gradient-to-br from-secondary/10 to-transparent shadow-lg scale-105"
            : "border-border bg-white hover:border-secondary/50"
        }`}
      >
        {tag && (
          <div className="mb-4 inline-block w-fit rounded-lg bg-secondary px-3 py-1 font-medium text-white text-sm">
            {tag}
          </div>
        )}
        <h3 className="text-h5 font-medium text-text-dark mb-3">{name}</h3>

        <div className="mb-6 border-b border-border pb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-h2 font-bold text-text-dark">{price}</span>
            <span className="text-sm text-text">{period}</span>
          </div>
        </div>

        <ul className="mb-8 flex-grow space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-secondary text-text">{feature}</span>
            </li>
          ))}
        </ul>

        {isDisabled ? (
          <button
            disabled
            className={`btn w-full py-3 rounded-lg font-semibold transition-all duration-300 text-center opacity-60 cursor-not-allowed border-border bg-white text-text`}
          >
            {button.label}
          </button>
        ) : (
          <a
            href={button.link}
            className={`btn w-full py-3 rounded-lg font-semibold transition-all duration-300 text-center ${
              isHighlighted
                ? "btn-primary bg-secondary text-white hover:bg-secondary/90"
                : "btn-outline border-secondary text-secondary hover:bg-secondary hover:text-white"
            }`}
          >
            {button.label}
          </a>
        )}
      </div>
    </div>
  );
};

export default PricingCard;
