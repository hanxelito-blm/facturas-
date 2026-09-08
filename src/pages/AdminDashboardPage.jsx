import AdminDashboard from '../pages/AdminDashboard';
import InvoiceListPage from '../pages/InvoiceListPage';

const AdminDashboardPage = ({ invoices, onSelectInvoice, selectedInvoiceId, onTogglePaymentStatus, anomalyIds, onEditInvoice, onDeleteInvoice, t }) => {
  return (
    <div className="page-enter">
      <AdminDashboard invoices={invoices} t={t} />
      <div className="admin-section-title">Listado de Facturas (Solo Administradores)</div>
      <InvoiceListPage
        invoices={invoices}
        onSelectInvoice={onSelectInvoice}
        selectedInvoiceId={selectedInvoiceId}
        onTogglePaymentStatus={onTogglePaymentStatus}
        anomalyIds={anomalyIds}
        onEditInvoice={onEditInvoice}
        onDeleteInvoice={onDeleteInvoice}
        t={t}
      />
    </div>
  );
};

export default AdminDashboardPage;
