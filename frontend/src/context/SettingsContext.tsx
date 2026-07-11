import { createContext, use, useState, useEffect, PropsWithChildren } from 'react';
import api from 'api/axios';
import { useAuth } from './AuthContext';

interface Currency { code: string; symbol: string }
interface SettingsCtx { currency: Currency }

const defaultCurrency: Currency = { code: 'PKR', symbol: '₨' };
const SettingsContext = createContext<SettingsCtx>({ currency: defaultCurrency });

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const { token } = useAuth();
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    if (!token) return;
    api.get('/settings')
      .then(res => { if (res.data?.currency?.code) setCurrency(res.data.currency); })
      .catch(() => {});
  }, [token]);

  return <SettingsContext value={{ currency }}>{children}</SettingsContext>;
};

export const useCurrency = () => use(SettingsContext).currency;
