
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboard } from '@/context/DashboardContext';
import { calculateMetrics } from '@/utils/dataProcessor';

const SummaryCards = () => {
  const { filteredData, isLoading } = useDashboard();
  
  // Calculate metrics from filtered data
  const metrics = React.useMemo(() => {
    if (!filteredData) return { 
      totalTickets: 0, 
      openTickets: 0 
    };
    
    return calculateMetrics(filteredData);
  }, [filteredData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1">
      {/* Total Tickets */}
      <Card className="summary-card bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
        <CardContent className="p-6 flex flex-col">
          <h3 className="text-sm font-medium text-muted-foreground">Total Tickets</h3>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-bold">
              {isLoading ? '...' : metrics.totalTickets}
            </p>
            <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full px-2 py-0.5">
              Tickets
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Open Tickets
      <Card className="summary-card bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
        <CardContent className="p-6 flex flex-col">
          <h3 className="text-sm font-medium text-muted-foreground">Open Tickets</h3>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-bold">
              {isLoading ? '...' : metrics.openTickets}
            </p>
            <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-2 py-0.5">
              Active
            </span>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default SummaryCards;
