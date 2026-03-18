import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// 회원가입
export async function register(req: Request, res: Response) {
  const { email, password, nickname } = req.body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: '올바른 이메일 형식을 입력해주세요' })
    return
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: '비밀번호는 8자 이상이어야 합니다' })
    return
  }
  if (!nickname || nickname.trim().length === 0) {
    res.status(400).json({ error: '닉네임을 입력해주세요' })
    return
  }

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

  if (!email || !password) {
    res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' })
    return
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' })
    return
  }

  // HttpOnly 쿠키로 토큰 전달 (JS에서 접근 불가 — XSS 방어)
  res.cookie('access_token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7일
  })

  res.json({
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
    const { data } = await supabase.auth.getUser(token)
    if (data.user) {
      await supabase.auth.admin.signOut(data.user.id)
    }
  }

  res.clearCookie('access_token')
  res.json({ message: '로그아웃 완료' })
}
