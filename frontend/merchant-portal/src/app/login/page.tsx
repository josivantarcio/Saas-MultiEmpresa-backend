'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/features/auth/authSlice';

// Esquema de validação
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  password: Yup.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
});

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(login(values));
      if (login.fulfilled.match(resultAction)) {
        toast.success('Login realizado com sucesso!');
        router.push('/dashboard');
      } else if (login.rejected.match(resultAction)) {
        toast.error(resultAction.payload as string || 'Falha na autenticação');
      }
    } catch (error) {
      toast.error('Erro ao realizar login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Portal do Lojista
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para acessar sua loja
          </p>
        </div>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                      errors.email && touched.email
                        ? 'border-red-300 placeholder-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-t-md focus:outline-none focus:z-10 sm:text-sm`}
                    placeholder="Email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Senha
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                      errors.password && touched.password
                        ? 'border-red-300 placeholder-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-b-md focus:outline-none focus:z-10 sm:text-sm`}
                    placeholder="Senha"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Lembrar-me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
