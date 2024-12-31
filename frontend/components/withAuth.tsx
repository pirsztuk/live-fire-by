import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function withAuth<T>(WrappedComponent: React.ComponentType<T>) {
  return function AuthComponent(props: T) {
    const router = useRouter()

    useEffect(() => {
      const token = sessionStorage.getItem('jwt_token')
      if (!token) {
        router.push('/login')
      }
    }, [router])

    return <WrappedComponent {...props} />
  }
}

