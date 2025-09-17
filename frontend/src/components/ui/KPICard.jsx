import React from 'react';

const KPICard = ({ title, value, description, icon, color = "#2962FF" }) => (
  <div className="rounded-xl border bg-white text-card-foreground shadow">
    <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {icon && <span className="text-lg">{icon}</span>}
    </div>
    <div className="p-6 pt-0">
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  </div>
);

export default KPICard;
