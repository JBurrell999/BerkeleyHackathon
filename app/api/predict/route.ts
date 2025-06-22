import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the ngrok URL from query params or use default
    const ngrokUrl = request.nextUrl.searchParams.get('url') || 'https://a636-2607-f140-6000-802b-d8f1-d31b-5440-8b73.ngrok-free.app/predict-rf'
    
    // Get the request body
    const body = await request.json()
    
    console.log('Proxying request to:', ngrokUrl)
    console.log('Request body:', body)
    
    // Make the request to the ngrok server
    const response = await fetch(ngrokUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Aviation-Dashboard/1.0',
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Ngrok API error:', response.status, errorText)
      return NextResponse.json(
        { error: `API Error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }
    
    const result = await response.json()
    console.log('Ngrok API response:', result)
    
    // Return the response with CORS headers
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
    
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to prediction service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 