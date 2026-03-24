'use client';

import React from 'react';

export default function AdminLoginForm() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      {/* L'encadré principal */}
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        
        {/* Titre de la section */}
        <h1 className="mb-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Connexion Admin
        </h1>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-2 text-left"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}