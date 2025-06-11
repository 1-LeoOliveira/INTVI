// app/api/token/route.js
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const TENANT_ID = process.env.NEXT_PUBLIC_AZURE_TENANT_ID
    const CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_AZURE_CLIENT_SECRET
    
    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Configurações Azure não encontradas' }, 
        { status: 500 }
      )
    }

    const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
    
    const formData = new URLSearchParams()
    formData.append('client_id', CLIENT_ID)
    formData.append('client_secret', CLIENT_SECRET)
    formData.append('scope', 'https://graph.microsoft.com/.default')
    formData.append('grant_type', 'client_credentials')

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro token Azure:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro ao obter token: ${response.status}` }, 
        { status: response.status }
      )
    }

    const tokenData = await response.json()
    
    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in
    })

  } catch (error) {
    console.error('Erro na API de token:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}