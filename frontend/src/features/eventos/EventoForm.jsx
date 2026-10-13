import { useState } from 'react';
import { useTenant } from '../../context/TenantContext.jsx';
import { Modal, Campo, PrimaryButton, GhostButton, inputStyle } from '../../components/ui.jsx';
import { fonteTitulo, cores } from '../../theme.js';

const CAMPOS_NUMERICOS = ['order', 'seatsUsed', 'seatsTotal'];

const CATEGORIAS = ['Palestra', 'Oficina', 'Congresso', 'Mostra', 'Competição', 'Roda de conversa'];
const TIPOS_APOIO = ['Patrocínio financeiro', 'Cessão de espaço', 'Apoio institucional'];

export default function EventoForm({ evento, salvando, proximaOrdem, onSalvar, onCancelar }) {
  const { corPrimaria: brand, modulosAtivos } = useTenant();
  const editando = Boolean(evento);
  const temGeo = modulosAtivos.includes('geo');
  const temCustomField = modulosAtivos.includes('customField');

  const [form, setForm] = useState(() => ({
    title: evento?.title ?? '',
    org: evento?.org ?? '',
    dateLabel: evento?.dateLabel ?? '',
    time: evento?.time ?? '',
    place: evento?.place ?? '',
    status: evento?.status ?? 'vagas',
    order: evento?.order ?? proximaOrdem,
    seatsUsed: evento?.seatsUsed ?? 0,
    seatsTotal: evento?.seatsTotal ?? 0,
    description: evento?.description ?? '',
    hours: evento?.hours ?? '',
    category: evento?.category ?? CATEGORIAS[0],
    speaker: evento?.speaker ?? '',
    speakerArea: evento?.speakerArea ?? '',
    address: evento?.address ?? '',
    empresaParceira: evento?.empresaParceira ?? '',
    tipoApoio: evento?.tipoApoio ?? TIPOS_APOIO[0]
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
    <Modal onFechar={onCancelar} largura={680}>
      <form onSubmit={submeter}>
        <h2 style={modalTitle}>{editando ? 'Editar evento' : 'Cadastrar evento'}</h2>
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
              style={inputStyle}
            />
          </Campo>

          <Campo full label="Organização">
            <input
              value={form.org}
              onChange={(e) => set('org', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          <Campo full label="Descrição">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              style={{ ...inputStyle, height: 'auto', padding: '11px 13px', resize: 'vertical', lineHeight: 1.55 }}
            />
          </Campo>

          <Campo label="Data">
            <input
              placeholder="12 de setembro"
              value={form.dateLabel}
              onChange={(e) => set('dateLabel', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          <Campo label="Horário">
            <input
              placeholder="19:00"
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          <Campo full label="Local">
            <input
              value={form.place}
              onChange={(e) => set('place', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          {temGeo && (
            <Campo full label="Endereço completo (para o mapa)">
              <input
                placeholder="Auditório Central — Bloco A, Campus Sede"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                style={inputStyle}
              />
            </Campo>
          )}

          <Campo label="Carga horária">
            <input
              placeholder="12h"
              value={form.hours}
              onChange={(e) => set('hours', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          <Campo label="Categoria">
            <select value={form.category} onChange={(e) => set('category', e.target.value)} style={inputStyle}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Palestrante">
            <input
              value={form.speaker}
              onChange={(e) => set('speaker', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          <Campo label="Área do palestrante">
            <input
              value={form.speakerArea}
              onChange={(e) => set('speakerArea', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          <Campo label="Status">
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              style={inputStyle}
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
              style={inputStyle}
            />
          </Campo>

          <Campo label="Vagas ocupadas">
            <input
              type="number"
              min="0"
              value={form.seatsUsed}
              onChange={(e) => set('seatsUsed', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          <Campo label="Vagas totais">
            <input
              type="number"
              min="0"
              value={form.seatsTotal}
              onChange={(e) => set('seatsTotal', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          {temCustomField && (
            <div
              style={{
                gridColumn: '1/-1',
                borderTop: `1px solid ${cores.divisor}`,
                paddingTop: 20,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '18px 20px'
              }}
            >
              <Campo label="Empresa parceira / patrocinadora">
                <input
                  placeholder="Ex.: Cooperativa Vale Tech"
                  value={form.empresaParceira}
                  onChange={(e) => set('empresaParceira', e.target.value)}
                  style={inputStyle}
                />
              </Campo>
              <Campo label="Tipo de apoio">
                <select value={form.tipoApoio} onChange={(e) => set('tipoApoio', e.target.value)} style={inputStyle}>
                  {TIPOS_APOIO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
          <PrimaryButton type="submit" brand={brand} disabled={salvando}>
            {salvando
              ? 'Salvando...'
              : editando
                ? 'Salvar alterações'
                : 'Cadastrar evento'}
          </PrimaryButton>
          <GhostButton type="button" onClick={onCancelar} style={{ height: 47, padding: '0 22px', fontSize: 14 }}>
            Cancelar
          </GhostButton>
        </div>
      </form>
    </Modal>
  );
}

const modalTitle = {
  fontFamily: fonteTitulo,
  fontWeight: 800,
  fontSize: 24,
  letterSpacing: '-.02em',
  margin: '0 0 6px'
};

const modalHint = {
  fontSize: 13,
  color: cores.textoSecundario,
  margin: '0 0 26px'
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '18px 20px'
};
