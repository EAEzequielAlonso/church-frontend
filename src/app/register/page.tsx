'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const password = watch('password');

    const onSubmit = async (data: any) => {
        setError('');
        setLoading(true);
        try {
            // Backend expects 'registerChurch' endpoint structure
            const payload = {
                churchName: data.churchName,
                email: data.email,
                password: data.password,
                fullName: data.fullName,
                churchSlug: data.churchSlug || undefined
            }

            const response = await api.post('/auth/register-church', payload);
            const { accessToken, user, churchId } = response.data;
            login(accessToken, user, churchId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar iglesia');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-100">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-primary">Registrar Nueva Iglesia</h1>
                    <p className="text-gray-500 mt-2 text-sm">Comienza tu prueba gratuita de 14 días.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Iglesia</label>
                        <input
                            type="text"
                            {...register('churchName', { required: 'Nombre de iglesia requerido' })}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        />
                        {errors.churchName && <span className="text-xs text-red-500">{errors.churchName.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Pastor/Admin</label>
                        <input
                            type="text"
                            {...register('fullName', { required: 'Nombre completo requerido' })}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        />
                        {errors.fullName && <span className="text-xs text-red-500">{errors.fullName.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Admin</label>
                        <input
                            type="email"
                            {...register('email', { required: 'Email es requerido' })}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        />
                        {errors.email && <span className="text-xs text-red-500">{errors.email.message as string}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                type="password"
                                {...register('password', { required: 'Min 6 caracteres', minLength: { value: 6, message: 'Min 6 chars' } })}
                                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                            />
                            {errors.password && <span className="text-xs text-red-500">{errors.password.message as string}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirmar</label>
                            <input
                                type="password"
                                {...register('confirmPassword', {
                                    validate: (val) => val === password || 'No coinciden'
                                })}
                                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                            />
                            {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message as string}</span>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-red-900 transition disabled:opacity-50 font-semibold"
                    >
                        {loading ? 'Creando Espacio...' : 'Registrar Iglesia'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                        Iniciar Sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
