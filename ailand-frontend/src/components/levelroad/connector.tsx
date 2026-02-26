import React from 'react';

interface ConnectorProps {
  fromCompleted: boolean;
}

const Connector: React.FC<ConnectorProps> = ({ fromCompleted }) => {
  const gradient =
    'linear-gradient(180deg, var(--palette-lavender) 0%, var(--palette-purple) 35%, var(--palette-terracotta) 70%, var(--palette-peach) 100%)';
  return (
    <div className="flex h-10 px-4">
      <div className="w-10 flex justify-center flex-shrink-0">
        <div
          className="w-1 h-full rounded-full"
          style={{
            background: gradient,
            opacity: fromCompleted ? 1 : 0.55,
          }}
        />
      </div>
    </div>
  );
};

export default Connector;
