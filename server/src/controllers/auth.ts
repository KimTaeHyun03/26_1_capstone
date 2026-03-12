import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// 회원가입
export async function register(req: Request, res: Response) {
  const { email, password, nickname } = req.body

  // Supabase Auth 회원가입
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  // public.users에 프로필 생성
  const { error: profileError } = await supabase
    .from('users')
    .insert({ id: data.user.id, email, nickname })

  if (profileError) {
    res.status(500).json({ error: profileError.message })
    return
  }

  res.status(201).json({ message: '회원가입 완료' })
}

// 로그인
export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' })
    return
  }

  res.json({
    access_token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  })
}

// 로그아웃
export async function logout(req: Request, res: Response) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (token) {
    await supabase.auth.admin.signOut(token)
  }

  res.json({ message: '로그아웃 완료' })
}
