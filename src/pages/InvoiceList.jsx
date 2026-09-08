import { useState } from 'react';
import { DocumentIcon, EyeIcon, CheckIcon, XIcon, PencilIcon, TrashIcon } from '../components/icons';
import AlertModal from './AlertModal';

const calculateTotal = (items) =>
  items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0
  );

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

const InvoiceList = ({
  invoices,
  onSelectInvoice,
  selectedInvoiceId,
  onTogglePaymentStatus,
  anomalyIds,
  onEditInvoice,
  onDeleteInvoice,
  t,
}) => {
  const [deleteId, setDeleteId] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const statusBadge = (invoice) => {
    const derived = getDerivedStatus(invoice);
    const isAnomaly = anomalyIds?.has(invoice.id);
    return (
      <div className="badges-cell">
        <span className={`badge badge-${derived.toLowerCase()}`}>{derived}</span>
        {isAnomaly && <span className="badge badge-anomaly">Anomalía</span>}
      </div>
    );
  };

  if (invoices.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <span>Listado de Facturas</span>
        </div>
        <div className="empty-state">
          <DocumentIcon size={48} />
          <p>No hay facturas registradas aún</p>
        </div>
      </div>
    );
  }

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteId(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete && onDeleteInvoice) {
      onDeleteInvoice(invoiceToDelete.id);
    }
    setDeleteId(false);
    setInvoiceToDelete(null);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span>Listado de Facturas</span>
      </div>
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Número</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th className="text-right">Total</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices
              .slice()
              .reverse()
              .map((invoice, index) => {
                const total = calculateTotal(invoice.items);
                const formattedTotal = new Intl.NumberFormat('es-PE', {
                  style: 'currency',
                  currency: 'USD',
                }).format(total);

                return (
                  <tr
                    key={invoice.id}
                    className={
                      selectedInvoiceId === invoice.id ? 'selected' : ''
                    }
                  >
                    <td>{invoices.length - index}</td>
                    <td>{invoice.number || '—'}</td>
                    <td>{invoice.cliente?.nombre || '—'}</td>
                    <td>{invoice.date || '—'}</td>
                    <td className="total-cell">{formattedTotal}</td>
                    <td>{statusBadge(invoice)}</td>
                    <td className="text-center">
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm btn-icon-only btn-view"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectInvoice(invoice);
                          }}
                          title={t('viewDetail')}
                        >
                          <EyeIcon />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm btn-icon-only btn-toggle"
                          onClick={() => onTogglePaymentStatus(invoice)}
                          title={
                            invoice.estadoPago === 'Pagada'
                              ? 'Marcar como Pendiente'
                              : 'Marcar como Pagada'
                          }
                        >
                          {invoice.estadoPago === 'Pagada' ? <XIcon /> : <CheckIcon />}
                        </button>
                        {onEditInvoice && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm btn-icon-only btn-edit"
                            onClick={() => onEditInvoice(invoice)}
                            title={t('edit')}
                          >
                            <PencilIcon />
                          </button>
                        )}
                        {onDeleteInvoice && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm btn-icon-only btn-delete"
                            onClick={() => handleDeleteClick(invoice)}
                            title={t('delete')}
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <AlertModal
        isOpen={deleteId}
        onClose={() => setDeleteId(false)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar la factura ${invoiceToDelete?.number || ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default InvoiceList;
