const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function buildUrl(path, query) {
  const basePath = path.startsWith('/') ? path : `/${path}`;
  const endpoint = API_BASE_URL ? `${API_BASE_URL}${basePath}` : basePath;
  const url = new URL(endpoint, window.location.origin);

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type');

  if (response.status === 204 || response.status === 205) {
    return null;
  }

  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

async function request(path, { method = 'GET', body, headers, query } = {}) {
  const finalHeaders = new Headers(headers || {});
  let finalBody = body;

  if (body && !(body instanceof FormData)) {
    if (typeof body === 'object') {
      finalBody = JSON.stringify(body);
    }

    if (!finalHeaders.has('Content-Type')) {
      finalHeaders.set('Content-Type', 'application/json');
    }
  }

  if (!finalHeaders.has('Accept')) {
    finalHeaders.set('Accept', 'application/json');
  }

  const endpoint = buildUrl(path, query);
  const response = await fetch(endpoint, {
    method,
    headers: finalHeaders,
    body: finalBody
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}`;

    try {
      const parsed = await parseResponse(response);
      if (parsed && typeof parsed === 'object' && parsed.message) {
        errorMessage = Array.isArray(parsed.message) ? parsed.message.join('. ') : parsed.message;
      } else if (typeof parsed === 'string') {
        errorMessage = parsed;
      }
    } catch (error) {
      // Ignore parsing errors and keep default message
    }

    throw new Error(errorMessage);
  }

  return parseResponse(response);
}

export function listSessions(query) {
  return request('/api/sessions', { query });
}

export function getSession(sessionId) {
  return request(`/api/sessions/${sessionId}`);
}

export function createSession(payload) {
  return request('/api/sessions', {
    method: 'POST',
    body: payload
  });
}

export function uploadRequestedProducts(sessionId, file) {
  const formData = new FormData();
  formData.append('file', file);

  return request(`/api/sessions/${sessionId}/requested-products`, {
    method: 'POST',
    body: formData
  });
}

export function createSessionSite(sessionId, site) {
  const formData = new FormData();
  formData.append('name', site.name);
  formData.append('baseUrl', site.baseUrl);
  if (site.file) {
    formData.append('file', site.file);
  }

  return request(`/api/sessions/${sessionId}/sites`, {
    method: 'POST',
    body: formData
  });
}

export function addSessionNode(sessionId, nodeType) {
  return request(`/api/sessions/${sessionId}/nodes`, {
    method: 'POST',
    body: { nodeType }
  });
}

export function reorderSessionNodes(sessionId, nodeIds) {
  return request(`/api/sessions/${sessionId}/nodes/reorder`, {
    method: 'PATCH',
    body: { nodeIds }
  });
}

export function resetSessionMatching(sessionId) {
  return request(`/api/sessions/${sessionId}/matching/reset`, {
    method: 'POST',
    body: {}
  });
}

export function updateCandidateStatus(sessionId, candidateId, status) {
  return request(`/api/sessions/${sessionId}/matching/candidates/${candidateId}/status`, {
    method: 'PATCH',
    body: { status }
  });
}

export function listMatchingNodes() {
  return request('/api/matching/nodes');
}

export function registerMatchingNode(payload) {
  return request('/api/matching/nodes', {
    method: 'POST',
    body: payload
  });
}

export function updateMatchingNode(nodeId, payload) {
  return request(`/api/matching/nodes/${nodeId}`, {
    method: 'PATCH',
    body: payload
  });
}

export function pingMatchingNode(nodeId) {
  return request(`/api/matching/nodes/${nodeId}/ping`, {
    method: 'POST'
  });
}
