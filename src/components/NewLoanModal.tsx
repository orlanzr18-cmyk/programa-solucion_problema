import React, { useState } from 'react';
import { X, Camera, Upload, UserPlus, Calendar, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { Category, Contact, LoanItem, LoanType } from '../types';
import { CATEGORIES_CONFIG } from '../utils';
import { CameraCaptureModal } from './CameraCaptureModal';

interface NewLoanModalProps {
  isOpen: boolean;
  contacts: Contact[];
  onClose: () => void;
  onSaveLoan: (newLoan: Omit<LoanItem, 'id' | 'createdAt' | 'remindersSentCount' | 'returned'>) => void;
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Contact;
  initialType?: LoanType;
}

const PRESET_PHOTOS = [
  { name: 'Libro', url: '/src/assets/images/book_clean_novel_1792862375368.jpg' },
  { name: 'Herramienta / Taladro', url: '/src/assets/images/cordless_drill_tool_1792862375730.jpg' },
  { name: 'Cargador / Cable', url: '/src/assets/images/usb_charger_cable_1792862375781.jpg' },
  { name: 'Mando consola', url: '/src/assets/images/retro_game_controller_1792862375751.jpg' },
];

export function NewLoanModal({
  isOpen,
  contacts,
  onClose,
  onSaveLoan,
  onAddContact,
  initialType = 'lent',
}: NewLoanModalProps) {
  const [loanType, setLoanType] = useState<LoanType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('otros');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [initialCondition, setInitialCondition] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || '');
  const [loanDate, setLoanDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<string>('');

  // Contact quick-creation state
  const [isAddingNewContact, setIsAddingNewContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState<Contact['relationship']>('amigo');

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [contactPickerError, setContactPickerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePickPhoneContact = async () => {
    setContactPickerError(null);
    try {
      if ('contacts' in navigator && 'ContactsManager' in window) {
        // @ts-expect-error Web Contacts API is experimental in standards
        const props = await navigator.contacts.getProperties();
        const supportedProps = ['name', 'tel'].filter(p => props.includes(p));
        // @ts-expect-error Web Contacts API
        const contactsList = await navigator.contacts.select(supportedProps, { multiple: false });
        if (contactsList && contactsList.length > 0) {
          const picked = contactsList[0];
          const name = picked.name?.[0] || 'Contacto importado';
          const tel = picked.tel?.[0] || '';
          
          const created = onAddContact({
            name,
            phone: tel,
            relationship: 'amigo',
            avatarColor: 'bg-indigo-600',
          });
          setSelectedContactId(created.id);
          return;
        }
      } else {
        // Fallback: switch to manual quick add
        setIsAddingNewContact(true);
        setContactPickerError('Tu navegador no admite selección nativa de contactos. Puedes crearlo aquí abajo en un segundo.');
      }
    } catch {
      setIsAddingNewContact(true);
    }
  };

  const handleSaveContactInline = () => {
    if (!newContactName.trim()) return;
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const created = onAddContact({
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRelation,
      avatarColor: randomColor,
    });
    setSelectedContactId(created.id);
    setIsAddingNewContact(false);
    setNewContactName('');
    setNewContactPhone('');
  };

  const setQuickDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let contact = contacts.find(c => c.id === selectedContactId);
    if (!contact && isAddingNewContact && newContactName.trim()) {
      contact = onAddContact({
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relationship: newContactRelation,
        avatarColor: 'bg-blue-600',
      });
    }

    if (!contact && contacts.length > 0) {
      contact = contacts[0];
    }

    if (!contact) {
      contact = onAddContact({
        name: 'Amigo',
        relationship: 'amigo',
        avatarColor: 'bg-emerald-600',
      });
    }

    onSaveLoan({
      type: loanType,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      imageUrl: imageUrl || undefined,
      initialCondition: initialCondition.trim() || undefined,
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: contact.phone,
      loanDate,
      dueDate: dueDate || undefined,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
    });

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registrar préstamo</h2>
              <p className="text-xs text-slate-500">Recuerda qué entregaste, a quién y en qué condiciones</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {/* Type selector: Lo que presté vs Me prestaron */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                ¿Qué tipo de movimiento es?
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setLoanType('lent')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    loanType === 'lent'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🤝 Yo lo presté (Me lo deben)
                </button>
                <button
                  type="button"
                  onClick={() => setLoanType('borrowed')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    loanType === 'borrowed'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎒 Me lo prestaron (Debo devolver)
                </button>
              </div>
            </div>

            {/* Title & Category */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nombre del objeto *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Taladro percutor Bosch, Libro El Principito, Cargador 65W..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(CATEGORIES_CONFIG).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Valor estimado (opcional €/$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={estimatedValue}
                    onChange={e => setEstimatedValue(e.target.value)}
                    placeholder="Ej: 50"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Photo of the item */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Foto del objeto (así recuerdas exactamente qué y cómo era)
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Quitar foto
                  </button>
                )}
              </div>

              {imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-100 max-h-48 group">
                  <img
                    src={imageUrl}
                    alt="Vista previa del objeto"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold"
                    >
                      Tomar otra
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50/30 flex flex-col items-center justify-center gap-1.5 text-slate-700 transition-colors"
                    >
                      <Camera className="w-6 h-6 text-amber-600" />
                      <span className="text-xs font-bold">Tomar foto con cámara</span>
                      <span className="text-[10px] text-slate-400">Captura al instante</span>
                    </button>

                    <label className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50/30 flex flex-col items-center justify-center gap-1.5 text-slate-700 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 text-slate-500" />
                      <span className="text-xs font-bold">Subir de galería</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preset quick picks */}
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-400 block mb-1">O prueba con una foto de muestra:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_PHOTOS.map(preset => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setImageUrl(preset.url)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Initial condition */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Estado inicial de entrega
              </label>
              <input
                type="text"
                value={initialCondition}
                onChange={e => setInitialCondition(e.target.value)}
                placeholder="Ej: Nuevo en caja, con funda de cuero, pequeño raspón en la esquina..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Contact section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {loanType === 'lent' ? '¿A quién se lo diste?' : '¿Quién te lo prestó?'}
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePickPhoneContact}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    📱 Contacto del teléfono
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewContact(!isAddingNewContact)}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingNewContact ? 'Elegir existente' : 'Nuevo'}
                  </button>
                </div>
              </div>

              {contactPickerError && (
                <div className="p-2.5 bg-amber-50 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{contactPickerError}</span>
                </div>
              )}

              {isAddingNewContact ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newContactName}
                      onChange={e => setNewContactName(e.target.value)}
                      placeholder="Nombre del contacto *"
                      className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <input
                      type="tel"
                      value={newContactPhone}
                      onChange={e => setNewContactPhone(e.target.value)}
                      placeholder="Teléfono / WhatsApp (+34...)"
                      className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={newContactRelation}
                      onChange={e => setNewContactRelation(e.target.value as Contact['relationship'])}
                      className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="amigo">Amigo/a</option>
                      <option value="familia">Familia</option>
                      <option value="trabajo">Trabajo</option>
                      <option value="estudio">Estudio</option>
                      <option value="otro">Otro</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleSaveContactInline}
                      disabled={!newContactName.trim()}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Guardar y seleccionar
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={selectedContactId}
                  onChange={e => setSelectedContactId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''} · {c.relationship}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Dates: Loan date and Due date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Fecha del préstamo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={loanDate}
                    onChange={e => setLoanDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Fecha de devolución acordada
                  </label>
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      Sin límite
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                {/* Quick shortcuts */}
                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setQuickDueDate(7)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px]"
                  >
                    +7 días
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDueDate(14)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px]"
                  >
                    +14 días
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDueDate(30)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px]"
                  >
                    +1 mes
                  </button>
                </div>
              </div>
            </div>

            {/* Notes description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Notas adicionales (opcional)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Accesorios prestados, motivo del préstamo, etc."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-slate-900/10 flex items-center gap-2"
              >
                Guardar préstamo
              </button>
            </div>
          </form>
        </div>
      </div>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={img => setImageUrl(img)}
      />
    </>
  );
}
