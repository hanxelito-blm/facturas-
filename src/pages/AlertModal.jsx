import Modal from './Modal';

const AlertModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
  const typeClass = type === 'success' ? 'modal-success' : type === 'warning' ? 'modal-warning' : 'modal-danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={
      <>
        <button className="btn btn-outline btn-icon-only" onClick={onClose} title={cancelText}>
          ✕
        </button>
        <button className={`btn btn-${type === 'success' ? 'primary' : 'danger'} btn-icon-only`} onClick={onConfirm} title={confirmText}>
          {type === 'success' ? 'OK' : 'DEL'}
        </button>
      </>
    }>
      <div className={`alert-modal-content ${typeClass}`}>
        <div className="alert-modal-icon">
          {type === 'success' ? '[OK]' : type === 'warning' ? '[!]' : '[DEL]'}
        </div>
        <p>{message}</p>
      </div>
    </Modal>
  );
};

export default AlertModal;
