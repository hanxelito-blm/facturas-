import InvoiceForm from '../pages/InvoiceForm';

const InvoiceFormPage = ({ onAddInvoice, t, onSearchDNI }) => {
  return (
    <div className="page-enter">
      <InvoiceForm onAddInvoice={onAddInvoice} t={t} onSearchDNI={onSearchDNI} />
    </div>
  );
};

export default InvoiceFormPage;
