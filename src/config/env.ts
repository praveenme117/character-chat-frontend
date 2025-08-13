export interface PublicEnv {
    backendUrl: string;
  }
  
  export function getPublicEnv(): PublicEnv {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    if (!backendUrl) {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('NEXT_PUBLIC_BACKEND_URL is not set. Streaming and API calls will fail.');
      }
    }
    return { backendUrl };
  }
  
  export default getPublicEnv;
  
  
  