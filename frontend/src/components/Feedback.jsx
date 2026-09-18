export function Loading({ children = 'Carregando...' }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: 18,
        color: '#6B6880',
        boxShadow: '0 6px 20px rgba(27,26,35,.05)'
      }}
    >
      {children}
    </div>
  );
}

export function SuccessMessage({ message }) {
  return (
    <div
      style={{
        background: '#EAF7F1',
        color: '#0F6B54',
        borderRadius: 14,
        padding: '14px 18px',
        marginBottom: 18,
        fontSize: 14,
        fontWeight: 600
      }}
    >
      {message}
    </div>
  );
}

export function ErrorMessage({ message }) {
  return (
    <div
      style={{
        background: '#FFF0F3',
        color: '#B4234B',
        borderRadius: 14,
        padding: 18,
        marginBottom: 18
      }}
    >
      {message}
    </div>
  );
}
