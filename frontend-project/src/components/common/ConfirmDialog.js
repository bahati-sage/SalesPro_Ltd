import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }) => {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirm'} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message || 'Are you sure you want to proceed?'}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger" disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
