'use server'

const API_URL = 'http://26.99.103.209:3456'

interface VerifyResponse {
  success: boolean
  error?: string
  userType?: 'aluno' | 'pessoaFisica' | 'pessoaJuridica'
}

export async function authenticate(formData: FormData): Promise<VerifyResponse> {
  try {
    const email = formData.get('email') as string
    const matricula = formData.get('enrollment') as string
    const password = formData.get('password') as string

    console.log('Attempting authentication with:', { email, matricula, password })

    // Verifica aluno pela matrícula
    if (matricula) {
      const response = await fetch(`${API_URL}/alunos/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricula,
          password
        })
      })

      const data = await response.json()
      console.log('Student verification response:', data)

      if (response.ok) {
        return { 
          success: true, 
          userType: 'aluno'
        }
      }
    }

    // Verifica pessoa física ou jurídica pelo email
    if (email) {
      // Tenta autenticar como pessoa física
      const pfResponse = await fetch(`${API_URL}/pessoasFisicas/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      if (pfResponse.ok) {
        return { success: true, userType: 'pessoaFisica' }
      }

      // Se não for pessoa física, tenta pessoa jurídica
      const pjResponse = await fetch(`${API_URL}/pessoasJuridicas/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      if (pjResponse.ok) {
        return { success: true, userType: 'pessoaJuridica' }
      }
    }

    return { 
      success: false, 
      error: 'Email/Matrícula ou senha inválidos' 
    }

  } catch (error) {
    console.error('Erro na autenticação:', error)
    return { 
      success: false, 
      error: 'Erro ao tentar fazer login. Tente novamente.' 
    }
  }
}

