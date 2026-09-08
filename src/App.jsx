import { useState, useMemo, useEffect } from 'react';
import { ROUTES } from './routes/appRoutes';
import { db } from './db';
import { calculateAnomalies } from './services/invoiceService';
import { consultarRegistroNacional } from './services/registroNacionalService';
import { TranslationProvider, useTranslation } from './hooks/useTranslation';
import { useDarkMode } from './hooks/useDarkMode';
import { CurrencyProvider, useCurrency } from './hooks/useCurrency';
import { SunIcon, MoonIcon, GlobeIcon } from './components/icons';
import InvoiceFormPage from './pages/InvoiceFormPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import EditInvoiceModal from './pages/EditInvoiceModal';
import AlertModal from './pages/AlertModal';
import AIChat from './components/AIChat';
import './index.css';

const IVA_RATE = 19;

const InnerApp = () => {
  const { t, lang, changeLanguage, LANGUAGES } = useTranslation();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { currency, setCurrency, taxRate, config, formatCurrency, CURRENCIES } = useCurrency();
  
  const [invoices, setInvoices] = useState(() => db.getAll());
  const [selectedInvoice, setSelectedInvoice] = useState(() => db.getAll()[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState(ROUTES.EMPLOYEE);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.language-dropdown')) {
        setShowLanguageMenu(false);
      }
      if (!e.target.closest('.currency-dropdown')) {
        setShowCurrencyMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const anomalyIds = useMemo(() => calculateAnomalies(invoices), [invoices]);

  const addInvoice = (invoice) => {
    db.add(invoice);
    setInvoices(db.getAll());
    setSelectedInvoice(invoice);
  };

  const togglePaymentStatus = (invoice) => {
    db.update(invoice.id, {
      estadoPago: invoice.estadoPago === 'Pagada' ? 'Pendiente' : 'Pagada',
    });
    setInvoices(db.getAll());
    setSelectedInvoice((prev) =>
      prev?.id === invoice.id
        ? { ...prev, estadoPago: prev.estadoPago === 'Pagada' ? 'Pendiente' : 'Pagada' }
        : prev
    );
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
  };

  const handleSaveEdit = (updatedInvoice) => {
    db.update(updatedInvoice.id, {
      number: updatedInvoice.number,
      date: updatedInvoice.date,
      fechaVencimiento: updatedInvoice.fechaVencimiento,
      estadoPago: updatedInvoice.estadoPago,
      cliente: updatedInvoice.cliente,
    });
    setInvoices(db.getAll());
    setSelectedInvoice((prev) =>
      prev?.id === updatedInvoice.id ? { ...prev, ...updatedInvoice } : prev
    );
    setEditingInvoice(null);
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      db.delete(invoiceToDelete.id);
      setInvoices(db.getAll());
      setSelectedInvoice((prev) => {
        if (!prev) return db.getAll()[0];
        if (prev.id === invoiceToDelete.id) {
          const remaining = db.getAll();
          return remaining.length > 0 ? remaining[0] : null;
        }
        return prev;
      });
    }
    setShowDeleteAlert(false);
    setInvoiceToDelete(null);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setView(ROUTES.ADMIN);
  };

  const handleViewChange = (newView) => {
    if (newView === ROUTES.ADMIN && !isLoggedIn) {
      setView(ROUTES.LOGIN);
      return;
    }
    setView(newView);
  };

  const showAdmin = isLoggedIn && view === ROUTES.ADMIN;
  const showLogin = view === ROUTES.LOGIN && !isLoggedIn;

  return (
    <>
      <header className="app-header">
        <div className="header-top">
          <div className="header-title">
            <h1>{t('appName')}</h1>
            <p>{t('appDescription')}</p>
          </div>
          <div className="header-controls">
            <div className="currency-dropdown">
              <button
                className="currency-toggle"
                onClick={() => setShowCurrencyMenu((prev) => !prev)}
                title={`${t('currencyToggle')}: ${config.label}`}
              >
                <span className="currency-flag">{config.flag}</span>
                <span className="currency-code">{config.code}</span>
              </button>
              {showCurrencyMenu && (
                <div className="currency-menu">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      className={`currency-option ${currency === c.code ? 'currency-option--active' : ''}`}
                      onClick={() => {
                        setCurrency(c.code);
                        setShowCurrencyMenu(false);
                      }}
                    >
                      <span className="currency-flag">{c.flag}</span>
                      <span className="currency-label">{c.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
              title={isDark ? t('lightMode') : t('darkMode')}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className="language-dropdown">
              <button
                className="language-toggle"
                onClick={() => setShowLanguageMenu((prev) => !prev)}
                title={`${t('languageToggle')}: ${LANGUAGES.find(l => l.code === lang)?.label}`}
              >
                <GlobeIcon />
              </button>
              {showLanguageMenu && (
                <div className="language-menu">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      className={`language-option ${lang === l.code ? 'language-option--active' : ''}`}
                      onClick={() => {
                        changeLanguage(l.code);
                        setShowLanguageMenu(false);
                      }}
                    >
                      <span className="language-flag">{l.flag}</span>
                      <span className="language-label">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="view-switcher">
          <button
            className={`view-btn ${view === ROUTES.EMPLOYEE ? 'view-btn--active' : ''}`}
            onClick={() => handleViewChange(ROUTES.EMPLOYEE)}
            title={t('employeeView')}
          >
            [EMP]
          </button>
          <button
            className={`view-btn ${view === ROUTES.ADMIN ? 'view-btn--active' : ''}`}
            onClick={() => handleViewChange(ROUTES.ADMIN)}
            title={t('adminView')}
          >
            [ADM]
          </button>
          {isLoggedIn && (
            <span className="admin-badge">{t('adminBadge')}</span>
          )}
        </div>
      </header>

      {showAdmin ? (
        <main className="app-container admin-view">
          <AdminDashboardPage
            invoices={invoices}
            onSelectInvoice={setSelectedInvoice}
            selectedInvoiceId={selectedInvoice?.id}
            onTogglePaymentStatus={togglePaymentStatus}
            anomalyIds={anomalyIds}
            onEditInvoice={handleEditInvoice}
            onDeleteInvoice={handleDeleteClick}
            t={t}
            currency={currency}
            formatCurrency={formatCurrency}
            taxRate={taxRate}
          />
        </main>
      ) : showLogin ? (
        <LoginPage onLogin={handleLogin} t={t} />
      ) : (
        <main className="app-container">
          <div className="left-panel">
            <InvoiceFormPage onAddInvoice={addInvoice} t={t} onSearchDNI={consultarRegistroNacional} />
          </div>

          <div className="right-panel">
            <InvoiceDetailPage
              invoice={selectedInvoice}
              ivaRate={taxRate}
              formatCurrency={formatCurrency}
              currencyCode={currency}
            />
          </div>
        </main>
      )}
      
      <EditInvoiceModal
        isOpen={!!editingInvoice}
        onClose={() => setEditingInvoice(null)}
        invoice={editingInvoice}
        onSave={handleSaveEdit}
      />

      <AlertModal
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={confirmDelete}
        title={t('confirmDelete')}
        message={`${t('deleteMessage')} ${invoiceToDelete?.number || ''}? ${t('deleteWarning')}`}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        type="danger"
      />
      <AIChat isDark={isDark} />
    </>
  );
};

const App = () => {
  return (
    <TranslationProvider>
      <CurrencyProvider>
        <InnerApp />
      </CurrencyProvider>
    </TranslationProvider>
  );
};

export default App;
