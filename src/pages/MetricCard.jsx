import { AlertIcon } from '../components/icons/ExtraIcons.jsx';

const MetricCard = ({ title, value, subtitle, icon, trend, trendUp, alert }) => {
  return (
    <div className={`metric-card card ${alert ? 'metric-card--alert' : ''}`}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {icon && <span className="metric-icon">{icon}</span>}
      </div>
      <div className="metric-value">{value}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      {trend !== undefined && (
        <div className={`metric-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
          {trendUp ? '↑' : '↓'} {trend}%
        </div>
      )}
      {alert && (
        <div className="metric-alert">
          <AlertIcon />
          <span>Anomalía detectada</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
