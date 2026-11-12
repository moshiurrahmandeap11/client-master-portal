'use client';

import { useCallback, useEffect, useState } from 'react';
import { walletService } from '@/services';
import type { WalletTransaction } from '@/types';

export function useWallet(autoFetch = true) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await walletService.getTransactions();
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      setBalance(data.balance ?? data.walletBalance ?? 0);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ওয়ালেট তথ্য লোড করা যায়নি');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchWallet().catch(() => {});
    }
  }, [autoFetch, fetchWallet]);

  return { transactions, balance, loading, error, fetchWallet };
}
