'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/atoms/Button';
import { FormField } from '../../components/molecules/FormField';
import { Icon } from '../../components/atoms/Icon';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Credenciales incorrectas');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-blue-500/30">
            FP
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Finanzas Personales Pro</h1>
          <p className="text-xs text-slate-400">Ingresa a tu panel financiero seguro</p>
        </div>

        {error && (
          <div className="p-3.5 text-xs font-semibold text-rose-400 bg-rose-950/50 border border-rose-900 rounded-xl flex items-center gap-2">
            <Icon name="alert-circle" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Correo Electrónico" required>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-500"
            />
          </FormField>

          <FormField label="Contraseña" required>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-500"
            />
          </FormField>

          <Button variant="primary" size="lg" type="submit" isLoading={isLoading} className="w-full mt-2">
            Iniciar Sesión
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          ¿No tienes una cuenta aún?{' '}
          <Link href="/register" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
