import React from 'react';
import { toast } from 'react-hot-toast';
import Toast from '../components/common/Toast';

const renderToast = (type, title, message) =>
  toast.custom(() => React.createElement(Toast, { type, title, message }), {
    duration: 3500,
    position: 'top-right',
  });

export const toastService = {
  success(title, message) {
    renderToast('success', title, message);
  },
  error(title, message) {
    renderToast('error', title, message);
  },
  warning(title, message) {
    renderToast('warning', title, message);
  },
  info(title, message) {
    renderToast('info', title, message);
  },
};
