// Capa de datos: inicialización y acceso al estado de facturas
import { getInitialInvoices, calculateTotal } from '../services/invoiceService';

let invoices = getInitialInvoices();

export const db = {
  getAll: () => invoices,
  getById: (id) => invoices.find((inv) => inv.id === id),
  add: (invoice) => {
    invoices = [{ ...invoice, total: calculateTotal(invoice.items) }, ...invoices];
  },
  update: (id, updates) => {
    invoices = invoices.map((inv) => {
      if (inv.id !== id) return inv;
      const updated = { ...inv, ...updates };
      updated.total = calculateTotal(updated.items);
      return updated;
    });
  },
  delete: (id) => {
    invoices = invoices.filter((inv) => inv.id !== id);
  },
  reset: () => {
    invoices = getInitialInvoices();
  },
};

export default db;
