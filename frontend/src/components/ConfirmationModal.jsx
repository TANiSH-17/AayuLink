import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <div className="flex items-start gap-4">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-0 flex-grow">
            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              {title || 'Confirm Action'}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {message || 'Are you sure? This action cannot be undone.'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg transition-colors"
            onClick={onClose}
          >
            No, Cancel
          </button>
          <button
            type="button"
            className="px-5 py-2 text-white bg-red-600 hover:bg-red-700 font-semibold rounded-lg transition-colors"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}