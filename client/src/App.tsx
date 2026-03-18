import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Guide from './pages/Guide'
import Feeding from './pages/Feeding'
import Health from './pages/Health'
import Map from './pages/Map'
import Food from './pages/Food'
import Walk from './pages/Walk'
import Training from './pages/Training'
import AiDiagnosis from './pages/AiDiagnosis'
import Pets from './pages/Pets'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 인증 불필요 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 인증 불필요 - AppLayout 포함 */}
        <Route element={<AppLayout />}>
          <Route path="/guide" element={<Guide />} />
          <Route path="/food" element={<Food />} />
          <Route path="/training" element={<Training />} />
        </Route>

        {/* 인증 필요 - PrivateRoute + AppLayout */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/pets/new" element={<Pets />} />
            <Route path="/pets/:id" element={<Pets />} />
            <Route path="/feeding" element={<Feeding />} />
            <Route path="/health" element={<Health />} />
            <Route path="/map" element={<Map />} />
            <Route path="/walk" element={<Walk />} />
            <Route path="/ai-diagnosis" element={<AiDiagnosis />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
