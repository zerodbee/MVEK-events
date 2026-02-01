import { useState, useEffect } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [eventsMap, setEventsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (e) {
        console.error('Ошибка загрузки пользователей:', e);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUsers();
  }, [token]);

  const toggleUser = async (user) => {
    if (selectedUserId === user.id) {
      setSelectedUserId(null);
      return;
    }

    const missingIds = user.eventIds.filter(id => !eventsMap[id]);
    if (missingIds.length > 0) {
      try {
        const res = await fetch(`${BACKEND_URL}/geteventsbyids`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ eventIds: missingIds })
        });
        const events = await res.json();
        const newMap = { ...eventsMap };
        events.forEach(e => newMap[e._id] = e);
        setEventsMap(newMap);
      } catch (e) {
        console.error('Ошибка загрузки мероприятий:', e);
      }
    }

    setSelectedUserId(user.id);
  };

  if (loading) return <div className="users-admin">Загрузка...</div>;

  return (
  <div className="users-table-wrapper">
  <table className="users-table">
    <thead>
      <tr>
        <th>ФИО</th>
        <th>Email</th>
        <th>Действия</th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.fullName}</td>
          <td>{user.email}</td>
          <td>
            <button
              className="users-btn-toggle"
              onClick={() => toggleUser(user)}
            >
              {selectedUserId === user.id ? 'Скрыть' : 'Записи'}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
      {selectedUserId && (
        <div className="users-events-detail">
          <h3>Мероприятия пользователя</h3>
          <ul>
            {users
              .find(u => u.id === selectedUserId)
              ?.eventIds.map(id => eventsMap[id])
              .filter(Boolean)
              .map(event => (
                <li key={event._id} className="users-event-item">
                  <strong>{event.title}</strong> —{' '}
                  {new Date(event.date).toLocaleDateString('ru-RU')}
                  {event.location && ` — ${event.location}`}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}