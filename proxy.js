
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const apiEndpoint = url.searchParams.get('endpoint');

  if (!apiEndpoint) {
    return new Response('API endpoint parameter is missing', { status: 400 });
  }

  // Add the API key to the request
  const apiKey = '20211231102005'; // Replace with your actual API key
  const apiUrl = `${apiEndpoint}&serviceKey=${apiKey}`;

  const response = await fetch(apiUrl, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });

  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });

  return newResponse;
}
