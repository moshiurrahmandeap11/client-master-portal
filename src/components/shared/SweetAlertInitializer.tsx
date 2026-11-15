'use client';

import { useEffect } from 'react';
import { initSweetAlert } from '@/lib/sweetalert';

export default function SweetAlertInitializer() {
  useEffect(() => {
    initSweetAlert();
  }, []);

  return null;
}
