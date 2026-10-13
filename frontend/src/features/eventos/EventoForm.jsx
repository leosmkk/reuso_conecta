import { useEffect, useState } from 'react';
import { useTenant } from '../../context/TenantContext.jsx';
import { pesquisar } from '../../services/api.js';
import { ErrorMessage } from '../../components/Feedback.jsx';
import { rotuloData } from './rotuloData.js';
import { Modal, Campo, PrimaryButton, GhostButton, inputStyle } from '../../components/ui.jsx';
import { fonteTitulo, cores } from '../../theme.js';

const CAMPOS_NUMERICOS = ['order', 'seatsUsed', 'seatsTotal'];
const CAMPOS_COORDENADA = ['latitude', 'longitude'];

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
    data: evento?.data ?? '',
    time: evento?.time ?? '',
    horaFim: evento?.horaFim ?? '',
    palestranteId: evento?.palestranteId ?? '',
    latitude: evento?.latitude ?? '',
    longitude: evento?.longitude ?? '',
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

  const [palestrantes, setPalestrantes] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    pesquisar('palestrantes')
      .then(setPalestrantes)
      .catch((err) => console.error('Não foi possível carregar os palestrantes:', err));
  }, []);

  function set(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  // Escolher um palestrante cadastrado preenche nome e área; "Outro" deixa
  // os dois campos de texto livres (ex.: "Comitê científico").
  function escolherPalestrante(id) {
    const escolhido = palestrantes.find((p) => p._id === id);
    setForm((atual) => ({
      ...atual,
      palestranteId: id,
      speaker: escolhido ? escolhido.nome : atual.speaker,
      speakerArea: escolhido ? escolhido.areaAtuacao ?? '' : atual.speakerArea
    }));
  }

  function submeter(e) {
    e.preventDefault();

    if (!form.title.trim() || !form.data || !form.time.trim() || !form.place.trim()) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    setErro('');

    const dados = { ...form, dateLabel: rotuloData(form.data) };
    CAMPOS_NUMERICOS.forEach((campo) => {
      dados[campo] = Number(dados[campo]) || 0;
    });
    CAMPOS_COORDENADA.forEach((campo) => {
      dados[campo] = dados[campo] === '' ? null : Number(dados[campo]);
    });
    dados.palestranteId = dados.palestranteId || null;
    dados.horaFim = dados.horaFim || null;

    onSalvar(dados);
  }

  return (
    <Modal onFechar={onCancelar} largura={680}>
      <form onSubmit={submeter} noValidate>
        <h2 style={modalTitle}>{editando ? 'Alterar evento' : 'Cadastrar evento'}</h2>
        <p style={modalHint}>
          {editando
            ? 'Altera um registro de eventos; o palestrante vem do cadastro de palestrantes.'
            : 'Inclui um evento; o palestrante é lido do cadastro de palestrantes.'}
        </p>

        <div style={grid}>
          <Campo full label="Título do evento">
            <input
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
              type="date"
              value={form.data}
              onChange={(e) => set('data', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          <Campo label="Horário de início">
            <input
              placeholder="19:00"
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
              style={inputStyle}
            />
          </Campo>

          <Campo label="Horário de término">
            <input
              placeholder="22:00"
              value={form.horaFim}
              onChange={(e) => set('horaFim', e.target.value)}
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
            <>
              <Campo full label="Endereço completo (para o mapa)">
                <input
                  placeholder="Auditório Central — Bloco A, Campus Sede"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  style={inputStyle}
                />
              </Campo>
              <Campo label="Latitude">
                <input
                  type="number"
                  step="any"
                  placeholder="-25.4519"
                  value={form.latitude}
                  onChange={(e) => set('latitude', e.target.value)}
                  style={inputStyle}
                />
              </Campo>
              <Campo label="Longitude">
                <input
                  type="number"
                  step="any"
                  placeholder="-49.2578"
                  value={form.longitude}
                  onChange={(e) => set('longitude', e.target.value)}
                  style={inputStyle}
                />
              </Campo>
            </>
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

          <Campo full label="Palestrante cadastrado">
            <select
              value={form.palestranteId}
              onChange={(e) => escolherPalestrante(e.target.value)}
              style={inputStyle}
            >
              <option value="">Outro / convidado (texto livre)</option>
              {palestrantes.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Nome do palestrante">
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

        {erro && (
          <div style={{ marginTop: 22 }}>
            <ErrorMessage message={erro} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: erro ? 0 : 26 }}>
          <PrimaryButton type="submit" brand={brand} disabled={salvando}>
            {salvando
              ? 'Salvando...'
              : editando
                ? 'Salvar alterações'
                : 'Salvar evento'}
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
