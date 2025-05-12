
import React from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import Sidebar from '@/components/Dashboard/Sidebar';
import SummaryCards from '@/components/Dashboard/SummaryCards';
import Charts from '@/components/Dashboard/Charts';
import ThemeToggle from '@/components/Dashboard/ThemeToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import FileUpload from '@/components/Dashboard/FileUpload';

const Index = () => {
  return (
    <DashboardProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b p-4 flex items-center justify-between bg-background">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Excel Ticket Analysis</p>
            </div>
            <ThemeToggle />
          </header>
          <ScrollArea className="flex-1 p-6">
            <div className="container mx-auto space-y-8">
              {/* File Upload Section
              <section className="mb-8">
                <FileUpload />
              </section> */}
              
              {/* Summary Cards */}
              <section>
                <SummaryCards />
              </section>
              
              {/* Charts */}
              <section>
                <Charts />
              </section>
              
              {/* Initial state message */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Upload an Excel file to see your data visualized</p>
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </DashboardProvider>
  );
};

export default Index;
