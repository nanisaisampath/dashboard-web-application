
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { addMonths, format } from 'date-fns';

// Define types for our context
export interface FilterState {
  startDate: Date;
  endDate: Date;
  technology: string;
  client: string;
  ticketType: string;
  assignedTo: string;
  status: string;
}

export interface TicketData {
  id: string | number;
  date: Date;
  technology: string;
  client: string;
  ticketType: string;
  assignedTo: string;
  status: string;
  responseTime?: number;
  satisfaction?: number;
  [key: string]: any; // Allow for flexible data structure
}

interface DashboardContextType {
  rawData: any[] | null; // Raw data from Excel
  processedData: TicketData[] | null; // Processed ticket data
  filteredData: TicketData[] | null; // Data after filters applied
  filters: FilterState;
  uniqueValues: {
    technology: string[];
    client: string[];
    ticketType: string[];
    assignedTo: string[];
    status: string[];
  };
  isLoading: boolean;
  isDarkMode: boolean;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  loadExcelData: (data: any[]) => void;
  toggleDarkMode: () => void;
}

// Create the context with default values
export const DashboardContext = createContext<DashboardContextType>({
  rawData: null,
  processedData: null,
  filteredData: null,
  filters: {
    startDate: addMonths(new Date(), -2),
    endDate: addMonths(new Date(), -1),
    technology: 'All',
    client: 'All',
    ticketType: 'All',
    assignedTo: 'All',
    status: 'All',
  },
  uniqueValues: {
    technology: ['All'],
    client: ['All'],
    ticketType: ['All'],
    assignedTo: ['All'],
    status: ['All'],
  },
  isLoading: false,
  isDarkMode: false,
  updateFilters: () => {},
  resetFilters: () => {},
  applyFilters: () => {},
  loadExcelData: () => {},
  toggleDarkMode: () => {},
});

interface DashboardProviderProps {
  children: ReactNode;
}

// Provider component
export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  // Default dates (2 months before today and 1 month before today)
  const defaultStartDate = addMonths(new Date(), -2);
  const defaultEndDate = addMonths(new Date(), -1);

  // State
  const [rawData, setRawData] = useState<any[] | null>(null);
  const [processedData, setProcessedData] = useState<TicketData[] | null>(null);
  const [filteredData, setFilteredData] = useState<TicketData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    technology: 'All',
    client: 'All',
    ticketType: 'All',
    assignedTo: 'All',
    status: 'All',
  });

  // Unique values for dropdowns
  const [uniqueValues, setUniqueValues] = useState<DashboardContextType['uniqueValues']>({
    technology: ['All'],
    client: ['All'],
    ticketType: ['All'],
    assignedTo: ['All'],
    status: ['All'],
  });

  // Extract unique values from data for dropdowns
  const extractUniqueValues = (data: TicketData[]) => {
    const unique = {
      technology: ['All'],
      client: ['All'],
      ticketType: ['All'],
      assignedTo: ['All'],
      status: ['All'],
    };

    data.forEach((ticket) => {
      // Add non-null, non-empty values that don't already exist in the array
      if (ticket.technology && !unique.technology.includes(ticket.technology)) {
        unique.technology.push(ticket.technology);
      }
      if (ticket.client && !unique.client.includes(ticket.client)) {
        unique.client.push(ticket.client);
      }
      if (ticket.ticketType && !unique.ticketType.includes(ticket.ticketType)) {
        unique.ticketType.push(ticket.ticketType);
      }
      if (ticket.assignedTo && !unique.assignedTo.includes(ticket.assignedTo)) {
        unique.assignedTo.push(ticket.assignedTo);
      }
      if (ticket.status && !unique.status.includes(ticket.status)) {
        unique.status.push(ticket.status);
      }
    });

    return unique;
  };

  // Process raw Excel data into TicketData format
  const processRawData = (data: any[]): TicketData[] => {
    return data.map((row, index) => {
      // // Handle date parsing - assuming the date is in a property called 'Date' or similar
      // let ticketDate = new Date();
      
      // if (row.Date) {
      //   // Try to parse the date from the Excel data
      //   ticketDate = new Date(row.Date);
      //   // If the date is invalid, fallback to current date
      //   if (isNaN(ticketDate.getTime())) {
      //     console.warn(`Invalid date for row ${index}, using current date as fallback`);
      //     ticketDate = new Date();
      //   }
      // }

      return {
        id: row.ID || `ticket-${index}`,
        date: row['Assigned Date'] || 'Unknown',
        technology: row['Technology/Platform'] || 'Unknown',
        client: row.Client || 'Unknown',
        ticketType: row['Ticket Type'] || 'Unknown',
        assignedTo: row.AssignedTo || row['Assigned to'] || 'Unassigned',
        status: row.Status || 'Unknown',
        responseTime: null,
        satisfaction: null,
        // Include all original data as well
        ...row
      };
    });
  };

  // Apply filters to the processed data
  const applyFiltersToData = () => {
    if (!processedData) return;

    const filtered = processedData.filter((ticket) => {
      // Filter by date range
      const ticketDate = new Date(ticket.date);
      const isAfterStart = ticketDate >= filters.startDate;
      const isBeforeEnd = ticketDate <= filters.endDate;

      // Filter by dropdown selections (only if not set to 'All')
      const technologyMatch = filters.technology === 'All' || ticket.technology === filters.technology;
      const clientMatch = filters.client === 'All' || ticket.client === filters.client;
      const ticketTypeMatch = filters.ticketType === 'All' || ticket.ticketType === filters.ticketType;
      const assignedToMatch = filters.assignedTo === 'All' || ticket.assignedTo === filters.assignedTo;
      const statusMatch = filters.status === 'All' || ticket.status === filters.status;

      return isAfterStart && isBeforeEnd && technologyMatch && clientMatch && 
             ticketTypeMatch && assignedToMatch && statusMatch;
    });

    setFilteredData(filtered);
  };

  // Handle Excel data loading
  const loadExcelData = (data: any[]) => {
    setIsLoading(true);
    setRawData(data);
    
    // Process the raw data
    const processed = processRawData(data);
    setProcessedData(processed);
    
    // Extract unique values for filters
    const unique = extractUniqueValues(processed);
    setUniqueValues(unique);
    
    // Apply default filters to get initial filtered data
    setFilteredData(processed);
    
    setIsLoading(false);
  };

  // Update filters
  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filters to defaults
  const resetFilters = () => {
    setFilters({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      technology: 'All',
      client: 'All',
      ticketType: 'All',
      assignedTo: 'All',
      status: 'All',
    });
    
    // Apply the reset filters
    applyFiltersToData();
  };

  // Apply current filters
  const applyFilters = () => {
    applyFiltersToData();
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Effect for theme setup
  useEffect(() => {
    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Provide the context value
  const value = {
    rawData,
    processedData,
    filteredData,
    filters,
    uniqueValues,
    isLoading,
    isDarkMode,
    updateFilters,
    resetFilters,
    applyFilters,
    loadExcelData,
    toggleDarkMode,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook for using the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
