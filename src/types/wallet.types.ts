export interface WalletTransaction {
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;


  id: string;


  date: string;


  amount: number;


  type: 'recharge' | 'fee_deduction' | 'refund' | 'cashback';


  description: string;


  method: 'bKash' | 'Nagad' | 'Wallet' | 'Bank';


  trxId: string;


  status: 'completed' | 'pending' | 'failed';


  receiptUrl?: string;


}
