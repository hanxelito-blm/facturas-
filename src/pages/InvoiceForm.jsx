import { useState } from 'react';
import { PlusIcon, TrashIcon, SaveIcon, SearchIcon } from '../components/icons';
import { validateCedulaFormat } from '../services/registroNacionalService';

const initialItem = () => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: '',
  unitPrice: '',
});

const InvoiceForm = ({ onAddInvoice, t: _t, onSearchDNI }) => {
  const [formData, setFormData] = useState(() => ({
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentStatus: 'Pendiente',
    issuer: { name: '', taxId: '' },
      client: { name: '', address: '', email: '', cedula: '' },
    items: [initialItem()],
  }));

  const [errors, setErrors] = useState([]);

  const validate = () => {
    const newErrors = [];

    if (!formData.number.trim()) {
      newErrors.push('El número de factura es requerido');
    }
    if (!formData.date) {
      newErrors.push('La fecha de emisión es requerida');
    }
    if (!formData.dueDate) {
      newErrors.push('La fecha de vencimiento es requerida');
    }
    if (!formData.issuer.name.trim()) {
      newErrors.push('El nombre de la empresa emisora es requerido');
    }
    if (!formData.issuer.taxId.trim()) {
      newErrors.push('El RUC/NIT/ID fiscal es requerido');
    }
    if (!formData.client.name.trim()) {
      newErrors.push('El nombre del cliente es requerido');
    }
    if (!formData.client.address.trim() && !formData.client.email.trim()) {
      newErrors.push('Debe proporcionar dirección o correo del cliente');
    }

    const validItems = formData.items.filter(
      (item) =>
        item.description.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.unitPrice) > 0
    );
    if (validItems.length === 0) {
      newErrors.push('Debe agregar al menos un ítem válido');
    }

    formData.items.forEach((item, index) => {
      const itemNum = index + 1;
      if (!item.description.trim()) {
        newErrors.push(`Descripción del ítem ${itemNum} es requerida`);
      }
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        newErrors.push(`Cantidad del ítem ${itemNum} debe ser mayor a cero`);
      }
      const price = Number(item.unitPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.push(`Precio unitario del ítem ${itemNum} debe ser mayor a cero`);
      }
    });

    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleItemChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, initialItem()],
    }));
  };

  const removeItem = (id) => {
    if (formData.items.length <= 1) {
      setErrors(['Debe haber al menos un ítem']);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const resetForm = () => {
    setFormData({
      number: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentStatus: 'Pendiente',
      issuer: { name: '', taxId: '' },
    client: { name: '', address: '', email: '', cedula: '' },
      items: [initialItem()],
    });
    setErrors([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);

    const newInvoice = {
      id: crypto.randomUUID(),
      number: formData.number,
      date: formData.date,
      fechaVencimiento: formData.dueDate,
      estadoPago: formData.paymentStatus,
      issuer: formData.issuer,
      client: formData.client,
      items: formData.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };

    onAddInvoice(newInvoice);
    resetForm();
  };

  return (
    <div className="card">
      <div className="card-header">
        <PlusIcon />
        <span>Nueva Factura</span>
      </div>

      <form id="invoice-form" onSubmit={handleSubmit} className="card-body" noValidate>
        {errors.length > 0 && (
          <ul className="error-list">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}

        {/* --- Datos de la factura --- */}
        <div className="form-section-title">Datos de la Factura</div>
        <div className="form-row mb-12">
          <div className="form-group">
            <label>Número de Factura</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              placeholder="F-0001"
            />
          </div>
          <div className="form-group">
            <label>Fecha de Emisión</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row mb-12">
          <div className="form-group">
            <label>Fecha de Vencimiento</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Estado de Pago</label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
              className="form-select"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
            </select>
          </div>
        </div>

        {/* --- Datos del Emisor --- */}
        <div className="form-section-title">Datos del Emisor</div>
        <div className="form-row mb-12">
          <div className="form-group">
            <label>Nombre de la Empresa</label>
            <input
              type="text"
              value={formData.issuer.name}
              onChange={(e) => handleNestedChange('issuer', 'name', e.target.value)}
              placeholder="TechStore S.A."
            />
          </div>
          <div className="form-group">
            <label>RUC / NIT / ID Fiscal</label>
            <input
              type="text"
              value={formData.issuer.taxId}
              onChange={(e) => handleNestedChange('issuer', 'taxId', e.target.value)}
              placeholder="J-12345678-9"
            />
          </div>
        </div>

        {/* --- Datos del Cliente --- */}
        <div className="form-section-title">Datos del Cliente</div>
        <div className="form-row mb-12">
          <div className="form-group">
            <label>Nombre del Cliente</label>
            <input
              type="text"
              value={formData.client.name}
              onChange={(e) => handleNestedChange('client', 'name', e.target.value)}
              placeholder="Juan Pérez"
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              value={formData.client.address}
              onChange={(e) => handleNestedChange('client', 'address', e.target.value)}
              placeholder="Calle Falsa 123"
            />
          </div>
        </div>
        <div className="form-group full-width mb-12">
          <label>Correo Electrónico</label>
          <input
            type="email"
            value={formData.client.email}
            onChange={(e) => handleNestedChange('client', 'email', e.target.value)}
            placeholder="cliente@ejemplo.com"
          />
        </div>

        {/* --- Cédula Cliente (Registro Nacional CR) --- */}
        <div className="form-section-title">Datos de Identificación (Registro Nacional CR)</div>
        <div className="form-row mb-12">
          <div className="form-group">
            <label>Cédula de Identidad</label>
            <input
              type="text"
              value={formData.client.cedula}
              onChange={(e) => handleNestedChange('client', 'cedula', e.target.value)}
              placeholder="1-2345-6789"
              maxLength={12}
            />
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm btn-icon-only"
              onClick={async () => {
                const cedula = formData.client.cedula;
                if (!cedula || !validateCedulaFormat(cedula)) {
                  setErrors([`Formato de cédula inválido. Use: X-XXXX-XXXX`]);
                  return;
                }
                setErrors([]);
                const result = await onSearchDNI(cedula);
                if (result.success) {
                  handleNestedChange('client', 'name', result.data.nombreCompleto);
                  handleNestedChange('client', 'address', `${result.data.distrito}, ${result.data.canton}, ${result.data.provincia}`);
                } else {
                  setErrors([result.error]);
                }
              }}
              title="Buscar por cédula"
            >
              <SearchIcon />
            </button>
          </div>
        </div>

        {/* --- Ítems --- */}
        <div className="form-section-title">Ítems de la Factura</div>
        <table className="items-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(item.id, 'description', e.target.value)
                    }
                    placeholder={`Producto ${index + 1}`}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, 'quantity', e.target.value)
                    }
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(item.id, 'unitPrice', e.target.value)
                    }
                    placeholder="0.00"
                  />
                </td>
                <td className="text-center">
                  {formData.items.length > 1 && (
              <button
                type="button"
                className="btn-icon btn-danger"
                onClick={() => removeItem(item.id)}
                title="Eliminar ítem"
              >
                <TrashIcon />
              </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-12">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm btn-icon-only"
            onClick={addItem}
            title="Agregar Ítem"
          >
            <PlusIcon />
          </button>
        </div>
      </form>

      <div className="card-footer">
        <button type="submit" className="btn btn-primary btn-icon-only" form="invoice-form" title="Guardar Factura">
          <SaveIcon />
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;
