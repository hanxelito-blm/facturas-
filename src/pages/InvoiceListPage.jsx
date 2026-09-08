import InvoiceList from '../pages/InvoiceList';

const InvoiceListPage = ({ invoices, onSelectInvoice, selectedInvoiceId, onTogglePaymentStatus, anomalyIds, onEditInvoice, onDeleteInvoice, t }) => {
  return (
    <div className="page-enter">
      <InvoiceList
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

export default InvoiceListPage;
