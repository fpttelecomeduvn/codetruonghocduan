import '../styles/ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="btn btn-secondary" onClick={onCancel}>
            Hủy
          </button>
          <button
            className={isDangerous ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
