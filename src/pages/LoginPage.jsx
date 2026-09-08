import Login from '../pages/Login';

const LoginPage = ({ onLogin, t }) => {
  return (
    <div className="page-enter">
      <Login onLogin={onLogin} t={t} />
    </div>
  );
};

export default LoginPage;
