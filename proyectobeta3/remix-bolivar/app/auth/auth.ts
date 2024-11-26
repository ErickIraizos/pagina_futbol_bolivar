import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export async function UsuarioLogin(email: string, password: string) {
  try {
    const authData = await pb.collection('users').authWithPassword(email, password);
    console.log('Usuario autenticado:', authData);
    return authData;
  } catch (error) {
    console.error('Error de autenticación:', error);
    throw error;
  }
}

export async function UsuarioLogout() {
  try {
    await pb.authStore.clear();
    console.log('Logout successful');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
}

let isAuthenticating = false;

export async function verifyAuth() {
  if (isAuthenticating) return false;
  isAuthenticating = true;

  try {
    if (!pb.authStore.isValid) {
      pb.authStore.clear();
      return false;
    }
    await pb.collection('users').authRefresh();
    console.log('Token de autenticación válido');
    return true;
  } catch (error) {
    pb.authStore.clear();
    console.log('Error de autenticación:', error);
    return false;
  } finally {
    isAuthenticating = false;
  }
}

export { pb };