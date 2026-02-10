'use client';

import { useState } from 'react';
import {
  Book,
  Key,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Trash2,
  List,
  BarChart3
} from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth: boolean;
  permission?: string;
  params?: Array<{ name: string; type: string; required: boolean; description: string }>;
  body?: Array<{ name: string; type: string; required: boolean; description: string }>;
  response: string;
  example?: string;
}

const endpoints: Record<string, Endpoint[]> = {
  'Transfers': [
    {
      method: 'GET',
      path: '/api/v1/transfers',
      description: 'Lista tutti i transfers dell\'utente',
      auth: true,
      permission: 'read',
      params: [
        { name: 'status', type: 'string', required: false, description: 'Filtra per stato: active, expired, all' },
        { name: 'limit', type: 'number', required: false, description: 'Limite risultati (1-100, default: 20)' },
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "transferId": "uuid-xxx",
      "title": "My Transfer",
      "status": "active",
      "fileCount": 3,
      "totalSize": 1048576,
      "downloadCount": 5,
      "expiresAt": "2025-01-15T10:00:00Z",
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ],
  "meta": { "count": 1, "limit": 20 }
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/transfers',
      description: 'Crea un nuovo transfer',
      auth: true,
      permission: 'write',
      body: [
        { name: 'title', type: 'string', required: true, description: 'Titolo del transfer (1-100 caratteri)' },
        { name: 'message', type: 'string', required: false, description: 'Messaggio opzionale' },
        { name: 'expiryDays', type: 'number', required: false, description: 'Giorni prima della scadenza (1-365, default: 7)' },
        { name: 'password', type: 'string', required: false, description: 'Password per proteggere il transfer' },
        { name: 'recipientEmail', type: 'string', required: false, description: 'Email del destinatario' },
      ],
      response: `{
  "success": true,
  "data": {
    "id": "abc123",
    "transferId": "uuid-xxx",
    "title": "My Transfer",
    "status": "pending",
    "expiresAt": "2025-01-08T10:00:00Z",
    "createdAt": "2025-01-01T10:00:00Z",
    "uploadUrl": "/api/v1/transfers/abc123/files"
  },
  "message": "Transfer creato. Usa uploadUrl per caricare i file."
}`,
    },
    {
      method: 'GET',
      path: '/api/v1/transfers/:id',
      description: 'Ottieni dettagli di un transfer specifico',
      auth: true,
      permission: 'read',
      response: `{
  "success": true,
  "data": {
    "id": "abc123",
    "transferId": "uuid-xxx",
    "title": "My Transfer",
    "message": "Ecco i file",
    "status": "active",
    "fileCount": 3,
    "totalSize": 1048576,
    "downloadCount": 5,
    "hasPassword": false,
    "expiresAt": "2025-01-15T10:00:00Z",
    "createdAt": "2025-01-01T10:00:00Z",
    "downloadUrl": "https://flyfile.it/scarica/uuid-xxx",
    "files": [
      { "id": "file1", "name": "document.pdf", "size": 524288, "mimeType": "application/pdf" }
    ]
  }
}`,
    },
    {
      method: 'DELETE',
      path: '/api/v1/transfers/:id',
      description: 'Elimina un transfer e tutti i suoi file',
      auth: true,
      permission: 'delete',
      response: `{
  "success": true,
  "message": "Transfer eliminato con successo"
}`,
    },
  ],
  'Usage': [
    {
      method: 'GET',
      path: '/api/v1/usage',
      description: 'Statistiche di utilizzo API e account',
      auth: true,
      response: `{
  "success": true,
  "data": {
    "plan": "business",
    "storage": {
      "used": 1073741824,
      "limit": -1,
      "percentage": 0
    },
    "transfers": {
      "total": 50,
      "active": 30,
      "apiCreated": 25
    },
    "downloads": { "total": 500 },
    "api": {
      "totalCalls": 1500,
      "activeKeys": 3
    },
    "limits": {
      "rateLimit": "60 requests/minute",
      "maxKeys": 10
    }
  }
}`,
    },
  ],
};

const methodColors = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  PATCH: 'bg-yellow-100 text-yellow-700',
};

export default function ApiDocumentationPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleEndpoint = (id: string) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEndpoints(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Book className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-gray-600">FlyFile REST API v1</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Base URL</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-4 py-2 rounded border font-mono text-sm">
                https://flyfile.it/api/v1
              </code>
              <button
                onClick={() => copyToClipboard('https://flyfile.it/api/v1', 'baseurl')}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              >
                {copied === 'baseurl' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Autenticazione</h2>
          </div>

          <p className="text-gray-600 mb-4">
            Tutte le richieste API richiedono un'API key valida. Includi la chiave nell'header Authorization:
          </p>

          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100">
            <span className="text-blue-400">Authorization</span>: Bearer fly_xxxxxxxxxxxxxxxxx
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Le API keys sono disponibili solo per i piani Pro e Business.
              Puoi crearle nella sezione <a href="/api-keys" className="underline">API Keys</a>.
            </p>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Permessi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="font-semibold text-green-800 mb-1">read</div>
              <div className="text-sm text-green-700">Leggere transfers e files</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-800 mb-1">write</div>
              <div className="text-sm text-blue-700">Creare e modificare transfers</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="font-semibold text-red-800 mb-1">delete</div>
              <div className="text-sm text-red-700">Eliminare transfers e files</div>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        {Object.entries(endpoints).map(([category, categoryEndpoints]) => (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              {category === 'Transfers' && <FileText className="w-6 h-6 text-blue-600" />}
              {category === 'Usage' && <BarChart3 className="w-6 h-6 text-purple-600" />}
              {category}
            </h2>

            <div className="space-y-4">
              {categoryEndpoints.map((endpoint, index) => {
                const endpointId = `${category}-${index}`;
                const isExpanded = expandedEndpoints.has(endpointId);

                return (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleEndpoint(endpointId)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${methodColors[endpoint.method]}`}>
                          {endpoint.method}
                        </span>
                        <code className="font-mono text-sm">{endpoint.path}</code>
                        {endpoint.permission && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {endpoint.permission}
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <p className="text-gray-700 mb-4">{endpoint.description}</p>

                        {endpoint.params && endpoint.params.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">Query Parameters</h4>
                            <div className="bg-white rounded border divide-y">
                              {endpoint.params.map((param) => (
                                <div key={param.name} className="p-3 flex items-start gap-4">
                                  <code className="text-sm font-mono text-blue-600">{param.name}</code>
                                  <span className="text-xs text-gray-500">{param.type}</span>
                                  {param.required && (
                                    <span className="text-xs text-red-500">required</span>
                                  )}
                                  <span className="text-sm text-gray-600 flex-1">{param.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {endpoint.body && endpoint.body.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">Request Body</h4>
                            <div className="bg-white rounded border divide-y">
                              {endpoint.body.map((param) => (
                                <div key={param.name} className="p-3 flex items-start gap-4">
                                  <code className="text-sm font-mono text-blue-600">{param.name}</code>
                                  <span className="text-xs text-gray-500">{param.type}</span>
                                  {param.required && (
                                    <span className="text-xs text-red-500">required</span>
                                  )}
                                  <span className="text-sm text-gray-600 flex-1">{param.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm text-gray-900">Response</h4>
                            <button
                              onClick={() => copyToClipboard(endpoint.response, endpointId)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              {copied === endpointId ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto font-mono">
                            {endpoint.response}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Error Codes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Codici di Errore</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Codice</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Significato</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="px-4 py-3 font-mono">400</td><td className="px-4 py-3 text-gray-600">Bad Request - Parametri mancanti o non validi</td></tr>
                <tr><td className="px-4 py-3 font-mono">401</td><td className="px-4 py-3 text-gray-600">Unauthorized - API key mancante o non valida</td></tr>
                <tr><td className="px-4 py-3 font-mono">403</td><td className="px-4 py-3 text-gray-600">Forbidden - Permessi insufficienti</td></tr>
                <tr><td className="px-4 py-3 font-mono">404</td><td className="px-4 py-3 text-gray-600">Not Found - Risorsa non trovata</td></tr>
                <tr><td className="px-4 py-3 font-mono">429</td><td className="px-4 py-3 text-gray-600">Too Many Requests - Rate limit superato</td></tr>
                <tr><td className="px-4 py-3 font-mono">500</td><td className="px-4 py-3 text-gray-600">Internal Error - Errore interno del server</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rate Limits</h2>

          <p className="text-gray-600 mb-4">
            Le API hanno un limite di <strong>60 richieste al minuto</strong> per API key.
            Le risposte includono gli header di rate limiting:
          </p>

          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100">
            <div><span className="text-blue-400">X-RateLimit-Limit</span>: 60</div>
            <div><span className="text-blue-400">X-RateLimit-Remaining</span>: 55</div>
            <div><span className="text-blue-400">X-RateLimit-Reset</span>: 1704067200</div>
          </div>
        </div>
      </div>
    </div>
  );
}
