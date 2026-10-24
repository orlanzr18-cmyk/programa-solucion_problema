import { Contact, ContactReputation, LoanItem, WhatsAppTone } from '../types';

export const CATEGORIES_CONFIG = {
  libros: { label: 'Libros', icon: 'BookOpen', color: 'text-amber-700 bg-amber-50' },
  herramientas: { label: 'Herramientas', icon: 'Wrench', color: 'text-orange-700 bg-orange-50' },
  tecnologia: { label: 'Tecnología', icon: 'Laptop', color: 'text-blue-700 bg-blue-50' },
  ropa: { label: 'Ropa y Accesorios', icon: 'Shirt', color: 'text-pink-700 bg-pink-50' },
  dinero: { label: 'Dinero', icon: 'Coins', color: 'text-emerald-700 bg-emerald-50' },
  videojuegos: { label: 'Videojuegos', icon: 'Gamepad2', color: 'text-indigo-700 bg-indigo-50' },
  hogar: { label: 'Hogar', icon: 'Home', color: 'text-teal-700 bg-teal-50' },
  otros: { label: 'Otros', icon: 'Package', color: 'text-slate-700 bg-slate-100' },
};

export const RELATIONSHIP_LABELS: Record<string, string> = {
  amigo: 'Amigo/a',
  familia: 'Familia',
  trabajo: 'Trabajo / Colega',
  estudio: 'Estudio / Compañero',
  otro: 'Conocido / Otro',
};

export function getDaysDiff(fromDate: string, toDate: string = new Date().toISOString().slice(0, 10)): number {
  const d1 = new Date(fromDate);
  const d2 = new Date(toDate);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function formatElapsedDays(loanDate: string): string {
  const days = getDaysDiff(loanDate);
  if (days < 0) return 'Hoy';
  if (days === 0) return 'Prestado hoy';
  if (days === 1) return 'Hace 1 día';
  return `Hace ${days} días`;
}

export function getDueStatus(loan: LoanItem): {
  status: 'overdue' | 'due-soon' | 'on-track' | 'returned' | 'none';
  label: string;
  badgeColor: string;
  daysRemaining?: number;
} {
  if (loan.returned) {
    return {
      status: 'returned',
      label: loan.returnedDate ? `Devuelto el ${formatDateSpanish(loan.returnedDate)}` : 'Devuelto',
      badgeColor: 'text-emerald-700 bg-emerald-50',
    };
  }

  if (!loan.dueDate) {
    return {
      status: 'none',
      label: 'Sin fecha de retorno',
      badgeColor: 'text-slate-600 bg-slate-100',
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const diff = getDaysDiff(today, loan.dueDate); // positive = days until due, negative = overdue

  if (diff < 0) {
    const overdueDays = Math.abs(diff);
    return {
      status: 'overdue',
      label: overdueDays === 1 ? 'Vencido ayer' : `Vencido hace ${overdueDays} días`,
      badgeColor: 'text-rose-700 bg-rose-50',
      daysRemaining: diff,
    };
  }

  if (diff === 0) {
    return {
      status: 'due-soon',
      label: '¡Vence hoy!',
      badgeColor: 'text-amber-700 bg-amber-50',
      daysRemaining: 0,
    };
  }

  if (diff <= 3) {
    return {
      status: 'due-soon',
      label: `Vence en ${diff} ${diff === 1 ? 'día' : 'días'}`,
      badgeColor: 'text-amber-700 bg-amber-50',
      daysRemaining: diff,
    };
  }

  return {
    status: 'on-track',
    label: `Quedan ${diff} días`,
    badgeColor: 'text-slate-700 bg-slate-100',
    daysRemaining: diff,
  };
}

export function formatDateSpanish(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${months[mIdx] || month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function calculateReputation(contact: Contact, loans: LoanItem[]): ContactReputation {
  const contactLoans = loans.filter(l => l.contactId === contact.id || l.contactName.toLowerCase() === contact.name.toLowerCase());
  const lentToThem = contactLoans.filter(l => l.type === 'lent');
  const activeLent = lentToThem.filter(l => !l.returned);
  const returnedLent = lentToThem.filter(l => l.returned);

  const today = new Date().toISOString().slice(0, 10);
  const overdueLent = activeLent.filter(l => l.dueDate && l.dueDate < today);

  // Calculate average days to return
  let totalDays = 0;
  let countWithDates = 0;
  returnedLent.forEach(l => {
    if (l.loanDate && l.returnedDate) {
      const days = getDaysDiff(l.loanDate, l.returnedDate);
      if (days >= 0) {
        totalDays += days;
        countWithDates++;
      }
    }
  });

  const avgReturnDays = countWithDates > 0 ? Math.round(totalDays / countWithDates) : 0;

  // Determine reputation badge
  let badge: ContactReputation['badge'] = {
    label: 'Sin préstamos previos',
    description: 'Aún no le has prestado objetos registrados',
    color: 'text-slate-600 bg-slate-100',
    level: 'neutral',
  };

  if (lentToThem.length > 0) {
    if (overdueLent.length >= 2 || (overdueLent.length >= 1 && activeLent.length >= 3)) {
      badge = {
        label: 'Tiburón del préstamo 🦈',
        description: 'Tiene varios objetos demorados. ¡Piénsalo dos veces antes de prestarle!',
        color: 'text-rose-700 bg-rose-50',
        level: 'danger',
      };
    } else if (overdueLent.length >= 1) {
      badge = {
        label: 'En zona de demora ⚠️',
        description: 'Tiene al menos un objeto fuera de la fecha acordada.',
        color: 'text-amber-800 bg-amber-50',
        level: 'warning',
      };
    } else if (returnedLent.length >= 2 && activeLent.length === 0) {
      badge = {
        label: 'Devolvedor ejemplar ⭐',
        description: 'Ha devuelto todo puntualmente y en buen estado.',
        color: 'text-emerald-700 bg-emerald-50',
        level: 'excellent',
      };
    } else if (returnedLent.length >= 1) {
      badge = {
        label: 'Confiable y cumplidor 👍',
        description: 'Historial favorable de devoluciones.',
        color: 'text-blue-700 bg-blue-50',
        level: 'good',
      };
    } else {
      badge = {
        label: 'Préstamo en curso ⏳',
        description: 'Tiene objetos activos dentro del tiempo previsto.',
        color: 'text-slate-700 bg-slate-100',
        level: 'neutral',
      };
    }
  }

  return {
    contactId: contact.id,
    contactName: contact.name,
    totalLentToThem: lentToThem.length,
    currentlyPending: activeLent.length,
    returnedCount: returnedLent.length,
    overdueCount: overdueLent.length,
    avgReturnDays,
    badge,
  };
}

export function generateWhatsAppMessage(loan: LoanItem, tone: WhatsAppTone): string {
  const name = loan.contactName.trim().split(' ')[0] || 'amigo/a';
  const item = loan.title.trim();
  const dateFormatted = formatDateSpanish(loan.loanDate);

  if (loan.type === 'borrowed') {
    return `¡Hola ${name}! 👋 Te escribo porque tengo listo tu "${item}" que me prestaste. Avísame cuándo y por dónde te queda cómodo que te lo devuelva. ¡Muchas gracias por prestármelo!`;
  }

  switch (tone) {
    case 'amable':
      return `¡Hola ${name}! 👋 Espero que estés súper bien. Quería preguntarte qué tal vas con "${item}". Cuando tengas un tiempito me avisas para coordinar la devolución. ¡Un abrazo!`;

    case 'gracioso':
      return `¡Hola ${name}! 🛸 Oye, tu querido "${item}" me mandó un mensajito diciendo que extraña su casa jajaja. ¿Cuándo me lo devuelves? Avísame y nos coordinamos.`;

    case 'directo':
      return `Hola ${name}. Te escribo para coordinar la devolución de "${item}" que te presté el ${dateFormatted}. ¿Te vendría bien entregármelo esta semana?`;

    case 'cafe':
      return `¡Hola ${name}! ☕ ¿Cómo estás? ¿Nos vemos estos días a tomar un café o picar algo y de paso me pasas "${item}"? Avísame qué día te queda mejor.`;

    case 'firme':
      return `Hola ${name}. Disculpa la molestia, pero realmente necesito de vuelta "${item}" estos días para un compromiso. ¿Podríamos coordinar para que me lo pases cuanto antes? Gracias.`;

    case 'devolver_yo':
      return `¡Hola ${name}! 👋 Tengo listo tu "${item}". ¿Cuándo te viene bien que te lo acerque?`;

    default:
      return `Hola ${name}, ¿cómo estás? Te escribo para ver cuándo podemos coordinar la devolución de "${item}". ¡Gracias!`;
  }
}

export function buildWhatsAppUrl(phone: string | undefined, message: string): string {
  if (!phone) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  // Sanitize phone number (strip whitespace, dashes, parens)
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  if (cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.slice(1);
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}
