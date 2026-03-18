import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { setAuth } from '../../store/authSlice'
import api from '../../lib/axios'

const schema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/api/auth/login', data)
      const { id, email } = res.data.user
      localStorage.setItem('auth_user', JSON.stringify({ userId: id, email }))
      dispatch(setAuth({ userId: id, email }))
      navigate('/')
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401) {
        setError('root', { message: '이메일 또는 비밀번호가 올바르지 않습니다' })
      } else if (status >= 500) {
        setError('root', { message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요' })
      } else if (!status) {
        setError('root', { message: '네트워크 연결을 확인해주세요' })
      } else {
        setError('root', { message: '로그인 중 오류가 발생했습니다' })
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="이메일"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input
              {...register('password')}
              type="password"
              placeholder="비밀번호"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-blue-500 font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
