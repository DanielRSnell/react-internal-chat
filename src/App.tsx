import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { ChatInterface } from './components/chat/ChatInterface'

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ChatInterface />
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default App
