import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from '@/store'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import AssessmentIndex from '@/pages/assessment/Index'
import Questionnaire from '@/pages/assessment/Questionnaire'
import AssessmentResult from '@/pages/assessment/Result'
import DietIndex from '@/pages/diet/Index'
import DietRecord from '@/pages/diet/Record'
import DietAnalysis from '@/pages/diet/Analysis'
import DietRecipes from '@/pages/diet/Recipes'
import DietPlan from '@/pages/diet/Plan'
import ExerciseIndex from '@/pages/exercise/Index'
import ExerciseAssessment from '@/pages/exercise/Assessment'
import ExercisePlan from '@/pages/exercise/Plan'
import ExerciseRecord from '@/pages/exercise/Record'
import KnowledgeIndex from '@/pages/knowledge/Index'
import KnowledgeArticle from '@/pages/knowledge/Article'
import KnowledgeQA from '@/pages/knowledge/QA'
import ReportsIndex from '@/pages/reports/Index'
import ReportDetail from '@/pages/reports/Detail'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminUsers from '@/pages/admin/Users'
import AdminContent from '@/pages/admin/Content'
import AdminRecipes from '@/pages/admin/Recipes'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUserStore()
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUserStore()
  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/assessment" element={<AssessmentIndex />} />
          <Route path="/assessment/questionnaire" element={<Questionnaire />} />
          <Route path="/assessment/result" element={<AssessmentResult />} />
          <Route path="/assessment/result/:id" element={<AssessmentResult />} />
          <Route path="/diet" element={<DietIndex />} />
          <Route path="/diet/record" element={<DietRecord />} />
          <Route path="/diet/analysis" element={<DietAnalysis />} />
          <Route path="/diet/recipes" element={<DietRecipes />} />
          <Route path="/diet/plan" element={<DietPlan />} />
          <Route path="/exercise" element={<ExerciseIndex />} />
          <Route path="/exercise/assessment" element={<ExerciseAssessment />} />
          <Route path="/exercise/plan" element={<ExercisePlan />} />
          <Route path="/exercise/record" element={<ExerciseRecord />} />
          <Route path="/knowledge" element={<KnowledgeIndex />} />
          <Route path="/knowledge/article/:id" element={<KnowledgeArticle />} />
          <Route path="/knowledge/qa" element={<KnowledgeQA />} />
          <Route path="/reports" element={<ReportsIndex />} />
          <Route path="/reports/detail/:id" element={<ReportDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/recipes" element={<AdminRecipes />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
