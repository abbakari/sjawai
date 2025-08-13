import React, { createContext, useContext, useState, ReactNode } from 'react';

export type StockRequestType = 'stock_alert' | 'new_request' | 'stock_projection' | 'stock_overview' | 'reorder_request';
export type RequestStatus = 'draft' | 'sent_to_manager' | 'under_review' | 'approved' | 'rejected' | 'completed';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface StockAlert {
  id: string;
  itemName: string;
  currentStock: number;
  minimumLevel: number;
  alertType: 'low_stock' | 'out_of_stock' | 'overstocked';
  category: string;
  brand: string;
  location: string;
  createdBy: string;
  createdAt: string;
  status: RequestStatus;
  managerNotes?: string;
  priority: UrgencyLevel;
}

export interface StockRequest {
  id: string;
  type: StockRequestType;
  title: string;
  itemName: string;
  category: string;
  brand: string;
  requestedQuantity: number;
  currentStock: number;
  reason: string;
  customerName?: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
  sentToManagerAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  managerComments?: string;
  expectedDelivery?: string;
  estimatedCost?: number;
  supplierInfo?: string;
}

export interface StockProjection {
  id: string;
  itemName: string;
  category: string;
  brand: string;
  currentStock: number;
  projectedDemand: number;
  projectionPeriod: '1_month' | '3_months' | '6_months' | '1_year';
  seasonalFactor: number;
  notes: string;
  createdBy: string;
  createdAt: string;
  status: RequestStatus;
  managerFeedback?: string;
}

export interface StockOverview {
  id: string;
  title: string;
  description: string;
  items: Array<{
    itemName: string;
    category: string;
    currentStock: number;
    status: 'good' | 'warning' | 'critical';
    notes: string;
  }>;
  createdBy: string;
  createdAt: string;
  status: RequestStatus;
  managerReview?: string;
}

export interface StockContextType {
  stockRequests: StockRequest[];
  stockAlerts: StockAlert[];
  stockProjections: StockProjection[];
  stockOverviews: StockOverview[];
  
  // Stock Request Functions
  createStockRequest: (request: Omit<StockRequest, 'id' | 'createdAt' | 'status'>) => string;
  sendRequestToManager: (requestId: string) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, managerComments?: string) => void;
  
  // Stock Alert Functions
  createStockAlert: (alert: Omit<StockAlert, 'id' | 'createdAt' | 'status'>) => string;
  sendAlertToManager: (alertId: string) => void;
  updateAlertStatus: (alertId: string, status: RequestStatus, managerNotes?: string) => void;
  
  // Stock Projection Functions
  createStockProjection: (projection: Omit<StockProjection, 'id' | 'createdAt' | 'status'>) => string;
  sendProjectionToManager: (projectionId: string) => void;
  updateProjectionStatus: (projectionId: string, status: RequestStatus, managerFeedback?: string) => void;
  
  // Stock Overview Functions
  createStockOverview: (overview: Omit<StockOverview, 'id' | 'createdAt' | 'status'>) => string;
  sendOverviewToManager: (overviewId: string) => void;
  updateOverviewStatus: (overviewId: string, status: RequestStatus, managerReview?: string) => void;
  
  // Manager Functions
  getRequestsBySalesman: (salesmanName: string) => {
    requests: StockRequest[];
    alerts: StockAlert[];
    projections: StockProjection[];
    overviews: StockOverview[];
  };
  getRequestsByStatus: (status: RequestStatus) => {
    requests: StockRequest[];
    alerts: StockAlert[];
    projections: StockProjection[];
    overviews: StockOverview[];
  };
  
  // Bulk Actions
  sendAllToManager: (salesmanName: string) => void;
  approveMultiple: (ids: string[], type: 'requests' | 'alerts' | 'projections' | 'overviews', managerComments?: string) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

interface StockProviderProps {
  children: ReactNode;
}

export const StockProvider: React.FC<StockProviderProps> = ({ children }) => {
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);

  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);

  const [stockProjections, setStockProjections] = useState<StockProjection[]>([]);

  const [stockOverviews, setStockOverviews] = useState<StockOverview[]>([]);

  const createStockRequest = (request: Omit<StockRequest, 'id' | 'createdAt' | 'status'>) => {
    const id = `sr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRequest: StockRequest = {
      ...request,
      id,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    setStockRequests(prev => [...prev, newRequest]);
    return id;
  };

  const sendRequestToManager = (requestId: string) => {
    setStockRequests(prev => prev.map(request =>
      request.id === requestId
        ? { ...request, status: 'sent_to_manager', sentToManagerAt: new Date().toISOString() }
        : request
    ));
  };

  const updateRequestStatus = (requestId: string, status: RequestStatus, managerComments?: string) => {
    setStockRequests(prev => prev.map(request =>
      request.id === requestId
        ? {
            ...request,
            status,
            managerComments,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Manager' // In real app, this would be the actual manager name
          }
        : request
    ));
  };

  const createStockAlert = (alert: Omit<StockAlert, 'id' | 'createdAt' | 'status'>) => {
    const id = `sa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAlert: StockAlert = {
      ...alert,
      id,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    setStockAlerts(prev => [...prev, newAlert]);
    return id;
  };

  const sendAlertToManager = (alertId: string) => {
    setStockAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'sent_to_manager' }
        : alert
    ));
  };

  const updateAlertStatus = (alertId: string, status: RequestStatus, managerNotes?: string) => {
    setStockAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status, managerNotes }
        : alert
    ));
  };

  const createStockProjection = (projection: Omit<StockProjection, 'id' | 'createdAt' | 'status'>) => {
    const id = `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newProjection: StockProjection = {
      ...projection,
      id,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    setStockProjections(prev => [...prev, newProjection]);
    return id;
  };

  const sendProjectionToManager = (projectionId: string) => {
    setStockProjections(prev => prev.map(projection =>
      projection.id === projectionId
        ? { ...projection, status: 'sent_to_manager' }
        : projection
    ));
  };

  const updateProjectionStatus = (projectionId: string, status: RequestStatus, managerFeedback?: string) => {
    setStockProjections(prev => prev.map(projection =>
      projection.id === projectionId
        ? { ...projection, status, managerFeedback }
        : projection
    ));
  };

  const createStockOverview = (overview: Omit<StockOverview, 'id' | 'createdAt' | 'status'>) => {
    const id = `so_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newOverview: StockOverview = {
      ...overview,
      id,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    setStockOverviews(prev => [...prev, newOverview]);
    return id;
  };

  const sendOverviewToManager = (overviewId: string) => {
    setStockOverviews(prev => prev.map(overview =>
      overview.id === overviewId
        ? { ...overview, status: 'sent_to_manager' }
        : overview
    ));
  };

  const updateOverviewStatus = (overviewId: string, status: RequestStatus, managerReview?: string) => {
    setStockOverviews(prev => prev.map(overview =>
      overview.id === overviewId
        ? { ...overview, status, managerReview }
        : overview
    ));
  };

  const getRequestsBySalesman = (salesmanName: string) => {
    return {
      requests: stockRequests.filter(req => req.createdBy === salesmanName),
      alerts: stockAlerts.filter(alert => alert.createdBy === salesmanName),
      projections: stockProjections.filter(proj => proj.createdBy === salesmanName),
      overviews: stockOverviews.filter(overview => overview.createdBy === salesmanName)
    };
  };

  const getRequestsByStatus = (status: RequestStatus) => {
    return {
      requests: stockRequests.filter(req => req.status === status),
      alerts: stockAlerts.filter(alert => alert.status === status),
      projections: stockProjections.filter(proj => proj.status === status),
      overviews: stockOverviews.filter(overview => overview.status === status)
    };
  };

  const sendAllToManager = (salesmanName: string) => {
    const salesmanData = getRequestsBySalesman(salesmanName);
    
    // Send all draft items to manager
    salesmanData.requests.forEach(req => {
      if (req.status === 'draft') sendRequestToManager(req.id);
    });
    
    salesmanData.alerts.forEach(alert => {
      if (alert.status === 'draft') sendAlertToManager(alert.id);
    });
    
    salesmanData.projections.forEach(proj => {
      if (proj.status === 'draft') sendProjectionToManager(proj.id);
    });
    
    salesmanData.overviews.forEach(overview => {
      if (overview.status === 'draft') sendOverviewToManager(overview.id);
    });
  };

  const approveMultiple = (ids: string[], type: 'requests' | 'alerts' | 'projections' | 'overviews', managerComments?: string) => {
    const status: RequestStatus = 'approved';
    
    switch (type) {
      case 'requests':
        ids.forEach(id => updateRequestStatus(id, status, managerComments));
        break;
      case 'alerts':
        ids.forEach(id => updateAlertStatus(id, status, managerComments));
        break;
      case 'projections':
        ids.forEach(id => updateProjectionStatus(id, status, managerComments));
        break;
      case 'overviews':
        ids.forEach(id => updateOverviewStatus(id, status, managerComments));
        break;
    }
  };

  const value: StockContextType = {
    stockRequests,
    stockAlerts,
    stockProjections,
    stockOverviews,
    createStockRequest,
    sendRequestToManager,
    updateRequestStatus,
    createStockAlert,
    sendAlertToManager,
    updateAlertStatus,
    createStockProjection,
    sendProjectionToManager,
    updateProjectionStatus,
    createStockOverview,
    sendOverviewToManager,
    updateOverviewStatus,
    getRequestsBySalesman,
    getRequestsByStatus,
    sendAllToManager,
    approveMultiple
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};
