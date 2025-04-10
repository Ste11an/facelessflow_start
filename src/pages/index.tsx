import { useEffect, useState } from 'react'

export default function Home() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/get-users')
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  return (
    <div style={{ padding: '2rem', background: '#111', color: 'white' }}>
      <h1 style={{ fontSize: '2rem' }}>Användare från Supabase</h1>
      <ul style={{ marginTop: '1rem' }}>
        {users.map((user, index) => (
          <li key={index}>{user.name ?? 'Namnlös användare'}</li>
        ))}
      </ul>
    </div>
  )
}
