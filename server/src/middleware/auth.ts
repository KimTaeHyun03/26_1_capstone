import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

export interface AuthRequest extends Request {
  userId?: string
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token

  if (!token) {
    res.status(401).json({ error: '인증 토큰이 없습니다' })
    return
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다' })
    return
  }

  req.userId = data.user.id
  next()
}
