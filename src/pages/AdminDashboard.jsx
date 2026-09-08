import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import MetricCard from './MetricCard.jsx';
import { AlertIcon, ChartIcon } from '../components/icons/ExtraIcons.jsx';

const COLORS = ['#4a2e23', '#d4a373', '#8d7b68', '#c62828', '#2e7d32', '#ef6c00'];

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

// Genera array con los 12 meses del año actual, rellenando con 0 los meses sin datos
const getFullYearMonths = (ingresosPorPeriodo) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  // Crear mapa de datos existentes
  const dataMap = {};
  ingresosPorPeriodo.forEach(item => {
    dataMap[item.mes] = item;
  });

  // Generar 12 meses
  return monthNames.map((month, index) => {
    const monthKey = `${month} ${currentYear}`;
    const existing = dataMap[monthKey];
    return {
      mes: monthKey,
      mesShort: month,
      total: existing ? existing.total : 0,
      facturas: existing ? existing.facturas : 0,
      hasData: !!existing,
    };
  });
};

const AdminDashboard = ({ invoices, t, currency = 'CRC', formatCurrency, taxRate = 13 }) => {
  const analytics = useMemo(() => {
    if (invoices.length === 0) {
      return null;
    }

    const totals = invoices.map((inv) => inv.total || 0);
    const totalFacturado = totals.reduce((sum, t) => sum + t, 0);
    const numeroFacturas = invoices.length;
    const ticketPromedio = totalFacturado / numeroFacturas;

    const media = totalFacturado / numeroFacturas;
    const variance = totals.reduce((sum, t) => sum + Math.pow(t - media, 2), 0) / numeroFacturas;
    const desviacionEstandar = Math.sqrt(variance);
    const umbralAnomalia = media + 1.5 * desviacionEstandar;
    const facturasAtipicas = invoices.filter((inv) => (inv.total || 0) > umbralAnomalia);
    const idsAtipicos = new Set(facturasAtipicas.map((inv) => inv.id));

    const sortedByDate = [...invoices].sort((a, b) => {
      const da = new Date(a.fechaEmision || 0);
      const db = new Date(b.fechaEmision || 0);
      return da - db;
    });
    const last3 = sortedByDate.slice(-3);
    const proyeccion = last3.reduce((sum, inv) => sum + (inv.total || 0), 0) / last3.length;

    const estadoCounts = { Pagada: 0, Pendiente: 0, Vencida: 0 };
    invoices.forEach((inv) => {
      const status = getDerivedStatus(inv);
      estadoCounts[status] = (estadoCounts[status] || 0) + 1;
    });

    const clientesMap = {};
    invoices.forEach((inv) => {
      const clientName = inv.cliente?.nombre || 'Desconocido';
      if (!clientesMap[clientName]) {
        clientesMap[clientName] = 0;
      }
      clientesMap[clientName] += inv.total || 0;
    });
    const topClientes = Object.entries(clientesMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    const mesesMap = {};
    invoices.forEach((inv) => {
      if (!inv.fechaEmision) return;
      const date = new Date(inv.fechaEmision + 'T00:00:00');
      const mesKey = date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
      if (!mesesMap[mesKey]) {
        mesesMap[mesKey] = { mes: mesKey, total: 0, facturas: 0 };
      }
      mesesMap[mesKey].total += inv.total || 0;
      mesesMap[mesKey].facturas += 1;
    });
    const ingresosPorPeriodo = Object.values(mesesMap).sort((a, b) => {
      const dateA = new Date(a.mes + ' 01, 2024 00:00:00');
      const dateB = new Date(b.mes + ' 01, 2024 00:00:00');
      return dateA - dateB;
    });

    const distribucionCliente = Object.entries(clientesMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const ingresosFullYear = getFullYearMonths(ingresosPorPeriodo);

    return {
      totalFacturado,
      numeroFacturas,
      ticketPromedio,
      media,
      desviacionEstandar,
      umbralAnomalia,
      facturasAtipicas: facturasAtipicas.length,
      idsAtipicos,
      proyeccion,
      estadoCounts,
      topClientes,
      ingresosPorPeriodo,
      ingresosFullYear,
      distribucionCliente,
    };
  }, [invoices]);

  if (!analytics) {
    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <ChartIcon />
          <h2>{t('adminDashboard')}</h2>
        </div>
        <div className="empty-state">
          <p>No hay datos suficientes para generar métricas.</p>
        </div>
      </div>
    );
  }

  const hasAnomalies = analytics.facturasAtipicas > 0;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <ChartIcon />
        <h2>{t('adminDashboard')}</h2>
      </div>

      {/* ===== MÉTRICAS PRINCIPALES ===== */}
      <div className="metrics-grid">
        <MetricCard
          title={t('totalBilled')}
          value={formatCurrency(analytics.totalFacturado)}
          subtitle={`${analytics.numeroFacturas} ${t('invoicesRegistered')}`}
          icon={<ChartIcon />}
        />
        <MetricCard
          title={t('averageTicket')}
          value={formatCurrency(analytics.ticketPromedio)}
          subtitle={t('perInvoice')}
          icon={<ChartIcon />}
        />
        <MetricCard
          title={t('projection')}
          value={formatCurrency(analytics.proyeccion)}
          subtitle={t('last3Average')}
          icon={<ChartIcon />}
        />
        <MetricCard
          title={t('atypicalInvoices')}
          value={analytics.facturasAtipicas}
          subtitle={`${t('threshold')} ${formatCurrency(analytics.umbralAnomalia)}`}
          icon={<AlertIcon />}
          alert={hasAnomalies}
        />
      </div>

      {/* ===== GRID PRINCIPAL: 2 COLUMNAS ===== */}
      <div className="dashboard-grid">

        {/* COLUMNA IZQUIERDA */}
        <div className="dashboard-col">

          {/* ALERTA DE ANOMALÍAS */}
          {hasAnomalies && (
            <div className="section-card card anomaly-alert">
              <div className="anomaly-header">
                <AlertIcon />
                <span>{t('anomaly')}: {t('atypicalInvoices')}</span>
              </div>
              <div className="anomaly-body">
                <p>
                  {analytics.facturasAtipicas} {t('atypicalInvoices').toLowerCase()} {t('threshold')} {formatCurrency(analytics.umbralAnomalia)}.
                </p>
                <ul>
                  {invoices
                    .filter((inv) => analytics.idsAtipicos.has(inv.id))
                    .map((inv) => (
                      <li key={inv.id}>
                        <strong>{inv.numero || '—'}</strong> - {inv.cliente?.nombre || '—'} - {formatCurrency(inv.total || 0)}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {/* TOP 3 CLIENTES */}
          <div className="section-card card">
            <div className="section-header">
              <span>{t('topClients')}</span>
            </div>
            <div className="card-body">
              <div className="top-clients-list">
                {analytics.topClientes.map((cliente, index) => (
                  <div key={cliente.name} className="top-client-item">
                    <span className="client-rank">#{index + 1}</span>
                    <span className="client-name">{cliente.name}</span>
                    <span className="client-total">{formatCurrency(cliente.total)}</span>
                    <span className="client-percent">
                      {((cliente.total / analytics.totalFacturado) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ESTADÍSTICAS ADICIONALES */}
          <div className="stats-grid">
            <div className="stat-card card">
              <div className="stat-value">{analytics.numeroFacturas}</div>
              <div className="stat-label">Total Facturas</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{formatCurrency(analytics.ticketPromedio)}</div>
              <div className="stat-label">Ticket Promedio</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{formatCurrency(analytics.proyeccion)}</div>
              <div className="stat-label">Proyección</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{formatCurrency(analytics.media)}</div>
              <div className="stat-label">Media</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{formatCurrency(analytics.desviacionEstandar)}</div>
              <div className="stat-label">Desviación Estándar</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{formatCurrency(analytics.umbralAnomalia)}</div>
              <div className="stat-label">Umbral Anomalía</div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA */}
        <div className="dashboard-col">

          {/* GRÁFICO DE BARRAS - INGRESOS POR MES (AÑO COMPLETO) */}
          <div className="section-card card chart-card">
            <div className="section-header">
              <span>{t('revenuesByPeriod')}</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.ingresosFullYear} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6dcc8" vertical={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#8d7b68' }}
                    tickFormatter={(v) => formatCurrency(v).replace(/[A-Z]{3}/, '').trim()}
                  />
                  <YAxis
                    dataKey="mesShort"
                    type="category"
                    tick={{ fontSize: 12, fill: '#8d7b68' }}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(value), name]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e6dcc8',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                    labelFormatter={(label) => label}
                  />
                  <Bar
                    dataKey="total"
                    fill={(props) => {
                      const payload = props.payload;
                      if (!payload.hasData) return 'rgba(74, 46, 35, 0.15)';
                      // Encontrar el mes con mayor ingreso
                      const maxTotal = Math.max(...analytics.ingresosFullYear.filter(d => d.hasData).map(d => d.total));
                      if (payload.total === maxTotal && maxTotal > 0) return '#c62828'; // Rojo para el máximo
                      return '#4a2e23';
                    }}
                    radius={[0, 6, 6, 0]}
                    label={{
                      position: 'right',
                      formatter: (v, payload) => {
                        if (v <= 0) return '';
                        const maxTotal = Math.max(...analytics.ingresosFullYear.filter(d => d.hasData).map(d => d.total));
                        const isMax = v === maxTotal && maxTotal > 0;
                        return isMax ? `★ ${formatCurrency(v)}` : formatCurrency(v);
                      },
                      fill: '#8d7b68',
                      fontSize: 11,
                      fontWeight: 600,
                      offset: 5,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                <span className="legend-item"><span className="legend-color" style={{background: '#4a2e23'}}></span> Meses con ingresos</span>
                <span className="legend-item"><span className="legend-color" style={{background: '#c62828'}}></span> Mes con mayor ingreso</span>
                <span className="legend-item"><span className="legend-color" style={{background: 'rgba(74, 46, 35, 0.15)'}}></span> Meses sin datos</span>
              </div>
            </div>
          </div>

          {/* GRÁFICO PIE - DISTRIBUCIÓN POR CLIENTE */}
          <div className="section-card card chart-card">
            <div className="section-header">
              <span>{t('distributionByClient')}</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analytics.distribucionCliente}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {analytics.distribucionCliente.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CONTEOS DE ESTADO + DISTRIBUCIÓN POR ESTADO */}
          <div className="section-card card">
            <div className="section-header">
              <span>{t('invoiceStatus')}</span>
            </div>
            <div className="card-body">
              <div className="estado-counts">
                <div className="estado-item estado-pagada">
                  <span className="estado-label">{t('paidStatus')}</span>
                  <span className="estado-value">{analytics.estadoCounts.Pagada}</span>
                </div>
                <div className="estado-item estado-pendiente">
                  <span className="estado-label">{t('pendingStatus')}</span>
                  <span className="estado-value">{analytics.estadoCounts.Pendiente}</span>
                </div>
                <div className="estado-item estado-vencida">
                  <span className="estado-label">{t('overdueStatus')}</span>
                  <span className="estado-value">{analytics.estadoCounts.Vencida}</span>
                </div>
              </div>
              <div className="distribution-bars" style={{ marginTop: '16px' }}>
                <div className="distribution-item">
                  <div className="distribution-header">
                    <span>{t('paidStatus')}</span>
                    <span>{analytics.estadoCounts.Pagada} ({((analytics.estadoCounts.Pagada / analytics.numeroFacturas) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill distribution-fill--paid"
                      style={{ width: `${(analytics.estadoCounts.Pagada / analytics.numeroFacturas) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="distribution-item">
                  <div className="distribution-header">
                    <span>{t('pendingStatus')}</span>
                    <span>{analytics.estadoCounts.Pendiente} ({((analytics.estadoCounts.Pendiente / analytics.numeroFacturas) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill distribution-fill--pending"
                      style={{ width: `${(analytics.estadoCounts.Pendiente / analytics.numeroFacturas) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="distribution-item">
                  <div className="distribution-header">
                    <span>{t('overdueStatus')}</span>
                    <span>{analytics.estadoCounts.Vencida} ({((analytics.estadoCounts.Vencida / analytics.numeroFacturas) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill distribution-fill--overdue"
                      style={{ width: `${(analytics.estadoCounts.Vencida / analytics.numeroFacturas) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FACTURAS RECIENTES (ÚNICA) */}
          <div className="section-card card">
            <div className="section-header">
              <span>Facturas Recientes</span>
            </div>
            <div className="card-body">
              <table className="table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 5).map((invoice) => {
                    const total = invoice.total || 0;
                    const derivedStatus = getDerivedStatus(invoice);
                    return (
                      <tr key={invoice.id}>
                        <td>{invoice.number || '—'}</td>
                        <td>{invoice.cliente?.nombre || '—'}</td>
                        <td>{invoice.date || '—'}</td>
                        <td className="total-cell">{formatCurrency(total)}</td>
                        <td>
                          <span className={`badge badge-${derivedStatus.toLowerCase()}`}>
                            {derivedStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ANOMALÍAS DETALLADAS */}
          {hasAnomalies && (
            <div className="section-card card anomaly-alert">
              <div className="section-header" style={{ background: 'linear-gradient(135deg, rgba(198,40,40,0.1) 0%, rgba(239,108,0,0.1) 100%)' }}>
                <AlertIcon />
                <span>Anomalías Detectadas</span>
              </div>
              <div className="card-body">
                <div className="anomaly-grid">
                  {invoices
                    .filter((inv) => analytics.idsAtipicos.has(inv.id))
                    .map((inv) => (
                      <div key={inv.id} className="anomaly-card">
                        <div className="anomaly-card-header">
                          <span className="anomaly-number">{inv.number}</span>
                          <span className={`badge badge-${getDerivedStatus(inv).toLowerCase()}`}>
                            {getDerivedStatus(inv)}
                          </span>
                        </div>
                        <div className="anomaly-card-body">
                          <p><strong>Cliente:</strong> {inv.cliente?.nombre || '—'}</p>
                          <p><strong>Total:</strong> {formatCurrency(inv.total || 0)}</p>
                          <p><strong>Umbral:</strong> {formatCurrency(analytics.umbralAnomalia)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;