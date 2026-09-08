// Servicio de facturas: operaciones CRUD y cálculos derivados
import seedInvoicesData from '../json/seedInvoices.json';

const seedInvoices = seedInvoicesData.invoices;

export const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);

export const getDerivedStatus = (invoice) => {
  if (invoice.estadoPago === 'Pagada') return 'Pagada';
  if (invoice.fechaVencimiento) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(invoice.fechaVencimiento + 'T00:00:00');
    if (dueDate < today) return 'Vencida';
  }
  return 'Pendiente';
};

export const calculateAnomalies = (invoices) => {
  if (invoices.length === 0) return new Set();

  const totals = invoices.map((inv) => inv.total || 0);
  const total = totals.reduce((sum, t) => sum + t, 0);
  const media = total / totals.length;
  const variance = totals.reduce((sum, t) => sum + Math.pow(t - media, 2), 0) / totals.length;
  const desviacionEstandar = Math.sqrt(variance);
  const umbral = media + 1.5 * desviacionEstandar;

  const anomalyIds = new Set();
  invoices.forEach((inv) => {
    if ((inv.total || 0) > umbral) {
      anomalyIds.add(inv.id);
    }
  });

  return anomalyIds;
};

export const enrichInvoice = (invoice) => ({
  ...invoice,
  total: calculateTotal(invoice.items),
});

export const getInitialInvoices = () =>
  seedInvoices.map((inv) => enrichInvoice(inv));
