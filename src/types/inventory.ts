export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  category: ItemCategory;
  brandId: string;
  brand: ItemBrand;
  unitCost: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unit: string;
  supplier: string;
  supplierCode?: string;
  barcode?: string;
  location?: string;
  shelf?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  isSerialTracked: boolean;
  isBatchTracked: boolean;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastStockUpdate: string;
  stockStatus: 'low' | 'normal' | 'high' | 'out_of_stock';
  totalValue: number;
  averageCost: number;
  tags?: string[];
  notes?: string;
}

export interface ItemCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentCategoryId?: string;
  parentCategory?: ItemCategory;
  subCategories?: ItemCategory[];
  isActive: boolean;
  displayOrder: number;
  iconUrl?: string;
  color?: string;
  taxRate?: number;
  marginPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemBrand {
  id: string;
  name: string;
  code: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  isActive: boolean;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentTerms: string;
  leadTime: number;
  minOrderValue: number;
  currency: string;
  taxId?: string;
  rating: number;
  isActive: boolean;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  item: InventoryItem;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  reason: 'purchase' | 'sale' | 'return' | 'damage' | 'expired' | 'adjustment' | 'transfer' | 'production';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reference?: string;
  location?: string;
  fromLocation?: string;
  toLocation?: string;
  notes?: string;
  performedBy: string;
  approvedBy?: string;
  createdAt: string;
  batchNumber?: string;
  serialNumbers?: string[];
  expiryDate?: string;
}

export interface InventoryAdjustment {
  id: string;
  itemId: string;
  item: InventoryItem;
  oldQuantity: number;
  newQuantity: number;
  adjustmentQuantity: number;
  reason: string;
  notes?: string;
  performedBy: string;
  approvedBy?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface InventoryFormData {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId: string;
  unitCost: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unit: string;
  supplier: string;
  supplierCode?: string;
  barcode?: string;
  location?: string;
  shelf?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  isSerialTracked: boolean;
  isBatchTracked: boolean;
  expiryDate?: string;
  tags?: string[];
  notes?: string;
}

export interface CategoryFormData {
  name: string;
  code: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
  displayOrder: number;
  iconUrl?: string;
  color?: string;
  taxRate?: number;
  marginPercentage?: number;
}

export interface BrandFormData {
  name: string;
  code: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  isActive: boolean;
  country?: string;
}

export interface InventoryFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  supplier?: string;
  stockStatus?: 'all' | 'low' | 'normal' | 'high' | 'out_of_stock';
  isActive?: boolean;
  location?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalCategories: number;
  totalBrands: number;
  averageStockLevel: number;
  topCategories: {
    categoryId: string;
    categoryName: string;
    itemCount: number;
    totalValue: number;
  }[];
  topBrands: {
    brandId: string;
    brandName: string;
    itemCount: number;
    totalValue: number;
  }[];
  recentMovements: StockMovement[];
}
