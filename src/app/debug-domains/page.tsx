import { onGetAllAccountDomains } from '@/actions/settings'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const DebugDomainsPage = async () => {
  const user = await currentUser()
  if (!user) redirect('/auth/sign-in')

  const domains = await onGetAllAccountDomains()

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 Debug: Your Domain IDs</h1>

      <div style={{ background: '#f5f5f5', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
        <h3>Available Domains:</h3>
        {domains?.domains?.length ? (
          domains.domains.map((domain) => (
            <div key={domain.id} style={{ margin: '10px 0', padding: '10px', background: 'white', borderRadius: '4px' }}>
              <strong>Domain:</strong> {domain.name}<br/>
              <strong>ID:</strong> <code style={{ background: '#ffeb3b', padding: '2px 4px' }}>{domain.id}</code><br/>
              <strong>Has ChatBot:</strong> {domain.chatBot ? 'Yes' : 'No'}

              {domain.chatBot && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
                  <strong>ChatBot Details:</strong><br/>
                  <strong>Welcome Message:</strong> {domain.chatBot.welcomeMessage || 'None'}<br/>
                  <strong>Background:</strong> {domain.chatBot.background || 'Default'}<br/>
                  <strong>Icon:</strong> {domain.chatBot.icon || 'Default'}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>❌ No domains found. Please add a domain first in the dashboard.</p>
        )}
      </div>

      <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
        <h3>Next Steps:</h3>
        <ol>
          <li>Copy one of the domain IDs above</li>
          <li>Replace the hardcoded ID in your test files</li>
          <li>Test the chatbot embed</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/dashboard" style={{ color: '#007cba', textDecoration: 'none' }}>← Back to Dashboard</a>
      </div>
    </div>
  )
}

export default DebugDomainsPage