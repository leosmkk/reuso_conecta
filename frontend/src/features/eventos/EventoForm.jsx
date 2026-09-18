import { useState } from 'react';

const CAMPOS_NUMERICOS = ['order', 'seatsUsed', 'seatsTotal'];

export default function EventoForm({ evento, salvando, proximaOrdem, onSalvar, onCancelar }) {
  const editando = Boolean(evento);

  const [form, setForm] = useState(() => ({
    title: evento?.title ?? '',
    org: evento?.org ?? '',
    dateLabel: evento?.dateLabel ?? '',
    time: evento?.time ?? '',
    place: evento?.place ?? '',
    status: evento?.status ?? 'vagas',
    order: evento?.order ?? proximaOrdem,
    seatsUsed: evento?.seatsUsed ?? 0,
    seatsTotal: evento?.seatsTotal ?? 0
  }));

  function set(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function submeter(e) {
    e.preventDefault();

    const dados = { ...form };
    CAMPOS_NUMERICOS.forEach((campo) => {
      dados[campo] = Number(dados[campo]) || 0;
    });

    onSalvar(dados);
  }

  return (
    <div style={overlay} onClick={onCancelar}>
      <form
        style={modal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submeter}
      >
        <h2 style={modalTitle}>
          {editando ? 'Editar evento' : 'Cadastrar evento'}
        </h2>
        <p style={modalHint}>
          {editando
            ? 'As alterações são enviadas para a Function alterar (PUT /api/alterar/{id}).'
            : 'Os dados são enviados para a Function inserir (POST /api/inserir).'}
        </p>

        <div style={grid}>
          <Campo full label="Título do evento">
            <input
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              style={input}
            />
          </Campo>

          <Campo full label="Organização">
            <input
              value={form.org}
              onChange={(e) => set('org', e.target.value)}
              style={input}
            />
          </Campo>

          <Campo label="Data">
            <input
              placeholder="12 de setembro"
              value={form.dateLabel}
              onChange={(e) => set('dateLabel', e.target.value)}
              style={input}
            />
          </Campo>

          <Campo label="Horário">
            <input
              placeholder="19:00"
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
              style={input}
            />
          </Campo>

          <Campo full label="Local">
            <input
              value={form.place}
              onChange={(e) => set('place', e.target.value)}
              style={input}
            />
          </Campo>

          <Campo label="Status">
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              style={input}
            >
              <option value="vagas">Vagas abertas</option>
              <option value="inscrito">Inscrito</option>
              <option value="lotado">Lotado</option>
            </select>
          </Campo>

          <Campo label="Ordem na lista">
            <input
              type="number"
              value={form.order}
              onChange={(e) => set('order', e.target.value)}
              style={input}
            />
          </Campo>

          <Campo label="Vagas ocupadas">
            <input
              type="number"
              min="0"
              value={form.seatsUsed}
              onChange={(e) => set('seatsUsed', e.target.value)}
              style={input}
            />
          </Campo>

          <Campo label="Vagas totais">
            <input
              type="number"
              min="0"
              value={form.seatsTotal}
              onChange={(e) => set('seatsTotal', e.target.value)}
              style={input}
            />
          </Campo>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
          <button type="submit" disabled={salvando} style={primaryButton}>
            {salvando
              ? 'Salvando...'
              : editando
                ? 'Salvar alterações'
                : 'Cadastrar evento'}
          </button>
          <button type="button" onClick={onCancelar} style={secondaryButton}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({ label, full, children }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(27,26,35,.45)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '48px 20px',
  overflowY: 'auto',
  zIndex: 50
};

const modal = {
  width: '100%',
  maxWidth: 620,
  background: '#fff',
  borderRadius: 20,
  padding: 32,
  boxShadow: '0 20px 60px rgba(27,26,35,.22)'
};

const modalTitle = {
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: 24,
  letterSpacing: '-.02em',
  margin: '0 0 6px'
};

const modalHint = {
  fontSize: 13,
  color: '#6B6880',
  margin: '0 0 26px'
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '18px 20px'
};

const labelStyle = {
  display: 'block',
  font: '600 12px Inter, sans-serif',
  color: '#4A4857',
  marginBottom: 7
};

const input = {
  width: '100%',
  height: 44,
  border: '1px solid #E2E0EE',
  borderRadius: 12,
  padding: '0 13px',
  fontSize: 14,
  background: '#FAF9FD',
  color: '#1B1A23',
  outline: 'none'
};

const primaryButton = {
  height: 47,
  padding: '0 26px',
  border: 'none',
  borderRadius: 13,
  background: '#0F8A6B',
  color: '#fff',
  font: '700 14.5px Inter, sans-serif'
};

const secondaryButton = {
  height: 47,
  padding: '0 22px',
  border: '1px solid #E2E0EE',
  borderRadius: 13,
  background: '#fff',
  color: '#4A4857',
  font: '600 14px Inter, sans-serif'
};
