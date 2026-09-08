import { useState, useMemo } from 'react';
import Modal from './Modal';

const EditInvoiceModal = ({ isOpen, onClose, invoice, onSave }) => {
  const initialForm = useMemo(() => ({
    number: invoice?.number || '',
    date: invoice?.date || '',
    fechaVencimiento: invoice?.fechaVencimiento || '',
    estadoPago: invoice?.estadoPago || 'Pendiente',
    cliente: {
      nombre: invoice?.cliente?.nombre || '',
      direccion: invoice?.cliente?.direccion || '',
      correo: invoice?.cliente?.correo || '',
    },
  }), [invoice]);

  const [formData, setFormData] = useState(initialForm);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      cliente: { ...prev.cliente, [field]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...invoice,
      ...formData,
    });
    onClose();
  };

  if (!isOpen || !invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Factura" footer={
      <>
        <button type="button" className="btn btn-outline btn-icon-only" onClick={onClose} title="Cancelar">
          ✕
        </button>
        <button type="submit" form="edit-invoice-form" className="btn btn-primary btn-icon-only" title="Guardar Cambios">
          ✓
        </button>
      </>
    }>
      <form id="edit-invoice-form" onSubmit={handleSubmit} className="edit-form">
        <div className="form-row">
          <div className="form-group">
            <label>Número de Factura</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleChange('number', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha de Emisión</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fecha de Vencimiento</label>
            <input
              type="date"
              value={formData.fechaVencimiento}
              onChange={(e) => handleChange('fechaVencimiento', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Estado de Pago</label>
            <select
              value={formData.estadoPago}
              onChange={(e) => handleChange('estadoPago', e.target.value)}
              className="form-select"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
            </select>
          </div>
        </div>

        <div className="form-section-title">Datos del Cliente</div>
        <div className="form-group full-width">
          <label>Nombre del Cliente</label>
          <input
            type="text"
            value={formData.cliente.nombre}
            onChange={(e) => handleClientChange('nombre', e.target.value)}
            required
          />
        </div>
        <div className="form-group full-width">
          <label>Dirección</label>
          <input
            type="text"
            value={formData.cliente.direccion}
            onChange={(e) => handleClientChange('direccion', e.target.value)}
          />
        </div>
        <div className="form-group full-width">
          <label>Correo Electrónico</label>
          <input
            type="email"
            value={formData.cliente.correo}
            onChange={(e) => handleClientChange('correo', e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditInvoiceModal;
