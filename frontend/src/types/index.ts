export interface User {
  id: string;
  telegramId?: string;
  firstName: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
}

export interface UserSettings {
  language: string;
  currency: string;
  city: string;
  theme: 'light' | 'dark' | 'system';
}

export interface ShoppingList {
  id: string;
  name: string;
  familyId?: string;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
}

export interface ShoppingItem {
  id: string;
  listId: string;
  productId?: string;
  name: string;
  quantity: number;
  unit: string;
  isPurchased: boolean;
  price?: number;
  category?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  barcode?: string;
  defaultUnit: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ProductAlias {
  id: string;
  productId: string;
  alias: string;
}

export interface Family {
  id: string;
  name: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface FamilyInvite {
  id: string;
  familyId: string;
  code: string;
  expiresAt: string;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  action: string;
  targetId: string;
  targetType: string;
  createdAt: string;
  metadata?: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  itemId: string;
  remindAt: string;
}

export interface Budget {
  id: string;
  familyId?: string;
  amount: number;
  currency: string;
  period: 'monthly' | 'weekly';
  spent: number;
}

export interface PurchaseHistory {
  id: string;
  items: ShoppingItem[];
  totalAmount: number;
  date: string;
}

export interface RecurringItem {
  id: string;
  productId: string;
  intervalDays: number;
  nextDueDate: string;
  isActive: boolean;
}

export interface SmartReorderEvent {
  id: string;
  productId: string;
  suggestedDate: string;
  confidence: number;
}

export interface PriceObservation {
  id: string;
  productId: string;
  storeId: string;
  price: number;
  date: string;
}

export interface Store {
  id: string;
  name: string;
  address?: string;
  location?: { lat: number; lng: number };
}

export interface Market {
  id: string;
  city: string;
  country: string;
  currency: string;
}

export interface AIParsedItem {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

export interface AIShoppingPlan {
  items: AIParsedItem[];
  estimatedTotal?: number;
  suggestedStores?: Store[];
}

export interface AIBudgetSuggestion {
  category: string;
  currentSpending: number;
  suggestedLimit: number;
  reasoning: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CursorPagination<T> {
  data: T[];
  nextCursor?: string;
}
