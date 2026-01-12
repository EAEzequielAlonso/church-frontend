'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const onSubmit = async (data: any) => {
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/login', data);
            const { accessToken, user, churchId } = response.data;
            login(accessToken, user, churchId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">Ecclesia SaaS</h1>
                    <p className="text-gray-500 mt-2">Bienvenido de nuevo</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            {...register('email', { required: 'Email es requerido' })}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        />
                        {errors.email && <span className="text-xs text-red-500">{errors.email.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            {...register('password', { required: 'Contraseña requerida' })}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        />
                        {errors.password && <span className="text-xs text-red-500">{errors.password.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug de Iglesia (Opcional)</label>
                        <input
                            type="text"
                            {...register('churchSlug')}
                            placeholder="ej: iglesia-central"
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        />
                        <p className="text-xs text-gray-400 mt-1">Déjalo vacío para entrar a tu iglesia principal.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-red-900 transition disabled:opacity-50"
                    >
                        {loading ? 'Cargando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-600">
                    ¿No tienes cuenta?{' '}
                    <Link href="/register" className="text-primary font-semibold hover:underline">
                        Crear Iglesia
                    </Link>
                </p>
            </div>
        </div>
    );
}
