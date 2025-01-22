import React from 'react';
import { Badge } from 'react-bootstrap';

const StatusBadge = ({ status }) => {
  let variant;
  switch (status.toLowerCase()) {
    case 'paid':
      variant = 'success';
      break;
    case 'pending':
      variant = 'warning';
      break;
    case 'cancel':
      variant = 'danger';
      break;
    default:
      variant = 'secondary';
  }

  return <Badge bg={variant}>{status}</Badge>;
};

export default StatusBadge;
