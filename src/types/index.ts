export type LoanType = 'lent' | 'borrowed';

export type Category = 
  | 'libros'
  | 'herramientas'
  | 'tecnologia'
  | 'ropa'
  | 'dinero'
  | 'videojuegos'
  | 'hogar'
  | 'otros';

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  avatarColor: string;
  relationship: 'amigo' | 'familia' | 'trabajo' | 'estudio' | 'otro';
  notes?: string;
  createdAt: string;
}

export interface LoanItem {
  id: string;
  type: LoanType; // 'lent' = Yo presté | 'borrowed' = Me prestaron
  title: string;
  description?: string;
  category: Category;
  imageUrl?: string;
  initialCondition?: string; // e.g. "Nuevo", "Excelente", "Con funda", etc.
  contactId: string;
  contactName: string;
  contactPhone?: string;
  loanDate: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  returned: boolean;
  returnedDate?: string; // YYYY-MM-DD
  returnNotes?: string;
  returnConditionRating?: 1 | 2 | 3 | 4 | 5;
  estimatedValue?: number;
  remindersSentCount: number;
  lastReminderDate?: string;
  createdAt: string;
}

export interface ContactReputation {
  contactId: string;
  contactName: string;
  totalLentToThem: number;
  currentlyPending: number;
  returnedCount: number;
  overdueCount: number;
  avgReturnDays: number;
  badge: {
    label: string;
    description: string;
    color: string;
    level: 'excellent' | 'good' | 'warning' | 'danger' | 'neutral';
  };
}

export type WhatsAppTone = 
  | 'amable'
  | 'gracioso'
  | 'directo'
  | 'cafe'
  | 'firme'
  | 'devolver_yo';
