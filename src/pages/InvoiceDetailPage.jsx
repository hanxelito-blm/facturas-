import InvoiceDetail from '../pages/InvoiceDetail';

const InvoiceDetailPage = ({ invoice, ivaRate, formatCurrency, currencyCode }) => {
  return (
    <div className="page-enter">
      <InvoiceDetail
        key={invoice?.id}
        invoice={invoice}
        ivaRate={ivaRate}
        formatCurrency={formatCurrency}
        currencyCode={currencyCode}
      />
    </div>
  );
};

export default InvoiceDetailPage;
