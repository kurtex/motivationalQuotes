"use client";

import { useRouter } from 'next/navigation';

export default function DataDeletionClientPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const router = useRouter();

  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 md:p-12 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center pt-8">
          Eliminar tus datos
        </h1>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <p>
            Entendemos la importancia de tu privacidad y te ofrecemos control total sobre tu información.
          </p>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Opción 1: Eliminar la aplicación (Método recomendado)</h2>
            <p>
              La forma más sencilla y rápida de eliminar tus datos es desinstalar nuestra aplicación directamente desde la configuración de tu cuenta de Meta (Instagram o Threads).
            </p>
            <ol className="list-decimal list-inside mt-2 pl-4 space-y-1">
              <li>Ve a la configuración de tu cuenta en la aplicación de Instagram o Threads.</li>
              <li>Busca la sección de &quot;Aplicaciones y sitios web&quot;.</li>
              <li>Encuentra nuestra aplicación en la lista y selecciona &quot;Eliminar&quot;.</li>
            </ol>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Al hacer esto, Meta nos enviará una solicitud automática para que eliminemos todos los datos asociados a tu cuenta. Este proceso es irreversible y se completará de acuerdo con sus políticas.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Opción 2: Solicitud de eliminación manual</h2>
            <p>
              Si no puedes usar el método anterior o tienes alguna pregunta, puedes solicitar la eliminación de tus datos manualmente.
            </p>
            <p>
              Por favor, envía un correo electrónico a nuestra dirección de soporte con el asunto &quot;Solicitud de Eliminación de Datos&quot;.
            </p>
            {supportEmail ? (
              <a
                href={`mailto:${supportEmail}?subject=Solicitud%20de%20Eliminaci%C3%B3n%20de%20Datos`}
                className="mt-4 inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contactar a Soporte
              </a>
            ) : (
              <p className="mt-4 text-red-600 dark:text-red-400 font-semibold">
                La dirección de correo de soporte no está configurada. Por favor, contacta al administrador del sitio.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            De acuerdo con las políticas de la plataforma de Meta, procesaremos tu solicitud y eliminaremos permanentemente toda tu información de nuestros sistemas. Recibirás una confirmación una vez que el proceso se haya completado. Este proceso es irreversible.
          </p>
        </div>
      </div>
    </main>
  );
}