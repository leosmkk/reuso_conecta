import { useCallback, useEffect, useState } from 'react';
import { pesquisar, inserir, alterar, excluir } from '../services/api.js';

// Extraída literalmente da máquina de estado de AgendaPage.jsx (a primeira
// tela CRUD, testada ponta a ponta): refetch total após cada mutação (sem
// update otimista), loading por-item via id, erro genérico no load vs.
// interpolado (err.message) nas mutações, toast de sucesso com timeout.
//
// idDe(registro) resolve o id do jeito que cada tipo expõe — normalmente
// `_id`, mas fica configurável para telas que precisem de outra chave.
export function useCrud(tipo, { idDe = (registro) => registro._id, carregarAoMontar = true } = {}) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(carregarAoMontar);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmarId, setConfirmarId] = useState(null);
  const [excluindoId, setExcluindoId] = useState(null);

  const notificar = useCallback((texto) => {
    setAviso(texto);
    setTimeout(() => setAviso(''), 4000);
  }, []);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await pesquisar(tipo);
      setRegistros(dados);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os dados pela API.');
    } finally {
      setLoading(false);
    }
  }, [tipo]);

  useEffect(() => {
    if (carregarAoMontar) {
      carregar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  function abrirNovo() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  function abrirEdicao(registro) {
    setEmEdicao(registro);
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setEmEdicao(null);
  }

  async function salvar(dados) {
    try {
      setSalvando(true);
      setError('');

      if (emEdicao) {
        await alterar(tipo, idDe(emEdicao), dados);
        notificar('Registro alterado com sucesso.');
      } else {
        await inserir(tipo, dados);
        notificar('Registro inserido com sucesso.');
      }

      fecharForm();
      await carregar();
    } catch (err) {
      console.error(err);
      setError(`Não foi possível salvar o registro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id) {
    try {
      setExcluindoId(id);
      setError('');
      await excluir(tipo, id);
      setConfirmarId(null);
      notificar('Registro excluído com sucesso.');
      await carregar();
    } catch (err) {
      console.error(err);
      setError(`Não foi possível excluir o registro: ${err.message}`);
    } finally {
      setExcluindoId(null);
    }
  }

  return {
    registros,
    loading,
    error,
    aviso,
    notificar,
    carregar,
    formAberto,
    emEdicao,
    salvando,
    abrirNovo,
    abrirEdicao,
    fecharForm,
    salvar,
    confirmarId,
    setConfirmarId,
    excluindoId,
    remover
  };
}
