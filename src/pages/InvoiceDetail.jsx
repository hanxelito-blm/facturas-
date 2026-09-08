import { useMemo } from 'react';
import { DocumentIcon } from '../components/icons';

const getDerivedStatus = (invoice) => {
  if (invoice.estadoPago === 'Pagada') return 'Pagada';
  if (invoice.fechaVencimiento) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(invoice.fechaVencimiento + 'T00:00:00');
    if (dueDate < today) return 'Vencida';
  }
  return 'Pendiente';
};

const InvoiceDetail = ({ invoice, ivaRate = 13, formatCurrency, currencyCode = 'CRC' }) => {
  const derivedStatus = useMemo(() => {
    if (!invoice) return null;
    return getDerivedStatus(invoice);
  }, [invoice]);

  const { subtotal, taxAmount, total, formattedItems } = useMemo(() => {
    if (!invoice) {
      return {
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        formattedItems: [],
      };
    }

    const items = invoice.items.map((item) => {
      const qty = Number(item.quantity);
      const price = Number(item.unitPrice);
      const itemTotal = qty * price;
      return {
        id: item.id,
        description: item.description,
        quantity: qty,
        unitPrice: price,
        total: itemTotal,
        formattedUnitPrice: formatCurrency(price),
        formattedTotal: formatCurrency(itemTotal),
      };
    });

    const subt = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subt * (ivaRate / 100);
    const tot = subt + tax;

    return {
      subtotal: subt,
      taxAmount: tax,
      total: tot,
      formattedItems: items,
    };
  }, [invoice, ivaRate, formatCurrency]);

  if (!invoice) {
    return (
      <div className="invoice-placeholder card">
        <div className="empty-state">
          <DocumentIcon size={48} />
          <p>Selecciona una factura para ver los detalles</p>
        </div>
      </div>
    );
  }

  const statusClass = derivedStatus === 'Pagada' ? 'status-paid' : derivedStatus === 'Vencida' ? 'status-overdue' : 'status-pending';

  const taxLabel = currencyCode === 'USD' ? 'Tax' : 'IVA';

  return (
    <div className="invoice-detail" key={invoice.id}>
      <div className="invoice-detail-header">
        <div className="invoice-header-top">
          <h2>FACTURA</h2>
          <span className={`invoice-status-badge ${statusClass}`}>{derivedStatus}</span>
        </div>
        <div className="invoice-meta">
          <span>
            <strong>N°:</strong> {invoice.number || '—'}
          </span>
          <span>
            <strong>Fecha:</strong> {invoice.date || '—'}
          </span>
          <span>
            <strong>Vencimiento:</strong> {invoice.fechaVencimiento || '—'}
          </span>
        </div>
      </div>

      <div className="invoice-detail-body">
        {/* ===== Bloques de datos ===== */}
        <div className="data-grid">
          <div className="data-block">
            <h3>Emisor</h3>
            <p className="value">{invoice.emisor?.nombre || '—'}</p>
            <p>
              <span className="label">RUC/NIT/ID:</span>{' '}
              {invoice.emisor?.ruc || '—'}
            </p>
          </div>
          <div className="data-block">
            <h3>Cliente</h3>
            <p className="value">{invoice.cliente?.nombre || '—'}</p>
            {invoice.cliente?.direccion && (
              <p>
                <span className="label">Dirección:</span>{' '}
                {invoice.cliente.direccion}
              </p>
            )}
            {invoice.cliente?.correo && (
              <p>
                <span className="label">Correo:</span>{' '}
                {invoice.cliente.correo}
              </p>
            )}
          </div>
        </div>

        {/* ===== Tabla de ítems ===== */}
        <table className="invoice-items">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th className="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {formattedItems.map((item) => (
              <tr key={item.id}>
                <td className="item-desc">{item.description}</td>
                <td className="item-qty">{item.quantity}</td>
                <td>{item.formattedUnitPrice}</td>
                <td className="right">{item.formattedTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== Totales ===== */}
        <div className="invoice-totals">
          <div className="total-row">
            <span className="label">Subtotal</span>
            <span className="value">{formatCurrency(subtotal)}</span>
          </div>
          <div className="total-row">
            <span className="label">{taxLabel} ({ivaRate}%)</span>
            <span className="value">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="total-row grand-total">
            <span className="label">TOTAL GENERAL</span>
            <span className="value">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
