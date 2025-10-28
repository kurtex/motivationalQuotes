'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPolicyClientPage() {
  const router = useRouter();

  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 md:p-12 relative">
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
          Política de Privacidad
        </h1>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 prose prose-lg dark:prose-invert max-w-none">
          <p><strong>Última actualización:</strong> 28 de Octubre de 2025</p>

          <h2 className="text-xl font-semibold">1. Introducción</h2>
          <p>
            Bienvenido a nuestra aplicación de generación de frases motivacionales. Tu privacidad es muy importante para nosotros. Esta Política de Privacidad explica qué datos recopilamos, cómo los usamos y protegemos, y tus derechos sobre ellos.
          </p>

          <h2 className="text-xl font-semibold">2. Información que Recopilamos</h2>
          <p>
            Para poder ofrecer nuestros servicios, recopilamos la siguiente información cuando te autenticas usando tu cuenta de Meta (Threads):
          </p>
          <ul className="list-disc list-inside">
            <li><strong>ID de Usuario de Meta:</strong> Recibimos tu identificador de usuario único de Meta (`meta_user_id`) para crear y gestionar tu cuenta en nuestra aplicación. No recopilamos tu nombre real, correo electrónico ni otra información personal de tu perfil.</li>
            <li><strong>Token de Acceso:</strong> Almacenamos de forma segura un token de acceso que nos permite interactuar con la API de Threads en tu nombre (por ejemplo, para publicar las frases que programes). Este token se guarda encriptado.</li>
            <li><strong>Prompts del Usuario:</strong> Guardamos los prompts o las instrucciones que nos proporcionas para generar las frases.</li>
            <li><strong>Frases Generadas:</strong> Almacenamos las frases que la inteligencia artificial genera para ti.</li>
            <li><strong>Configuración de Programación:</strong> Si usas la función de programación, guardamos la configuración (frecuencia, hora, etc.) para realizar las publicaciones automáticas.</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Cómo Usamos tu Información</h2>
          <p>
            Utilizamos la información recopilada exclusivamente para los siguientes propósitos:
          </p>
          <ul className="list-disc list-inside">
            <li>Permitir el funcionamiento de la aplicación, como generar frases y publicarlas en tu perfil de Threads.</li>
            <li>Asociar los prompts y las frases generadas a tu cuenta.</li>
            <li>Gestionar la programación de publicaciones automáticas.</li>
            <li>Mantener y mejorar la seguridad y el rendimiento de nuestros servicios.</li>
          </ul>
          <p>No vendemos, compartimos ni transferimos tus datos a terceros.</p>

          <h2 className="text-xl font-semibold">4. Almacenamiento y Seguridad de Datos</h2>
          <p>
            Nos tomamos la seguridad de tus datos muy en serio. Los tokens de acceso se almacenan utilizando encriptación fuerte en nuestra base de datos. El resto de la información asociada a tu cuenta se protege con las mejores prácticas de seguridad para prevenir accesos no autorizados.
          </p>

          <h2 className="text-xl font-semibold">5. Eliminación de Datos</h2>
          <p>
            Tienes control total sobre tus datos. Puedes solicitar la eliminación completa de tu información de nuestros sistemas siguiendo las instrucciones en nuestra <a href="/threads/delete" className="text-blue-600 dark:text-blue-400 hover:underline">página de eliminación de datos</a>.
          </p>

          <h2 className="text-xl font-semibold">6. Cambios a esta Política de Privacidad</h2>
          <p>
            Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cualquier cambio publicando la nueva política en esta página. Se te aconseja revisar esta página periódicamente para cualquier cambio.
          </p>

          <h2 className="text-xl font-semibold">7. Contacto</h2>
          <p>
            Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contacta con el administrador de la aplicación.
          </p>
        </div>
      </div>
    </main>
  );
}
