'use server'

type ContactFormState = {
  success: boolean
  error: string
}

export async function createContactRequest(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const name = String(formData.get('name') || '').trim()
  const contact = String(formData.get('contact') || '').trim()
  const message = String(formData.get('message') || '').trim()

  if (!name) {
    return { success: false, error: 'El nombre es requerido' }
  }

  if (!contact) {
    return { success: false, error: 'El email o teléfono es requerido' }
  }

  // Aquí se guarda en DB
  // await db.contactRequest.create({
  //   data: { name, contact, message },
  // })

  return { success: true, error: '' }

}