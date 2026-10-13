import { useEffect, useState } from 'react';
import { pesquisar } from '../services/api.js';

/**
 * Carrega uma lista relacionada (alunos, eventos, inscrições...) uma vez,
 * no mount, e devolve como opções de <select> — usado pelos campos
 * `tipo: 'select'` de Inscrições/Presenças/Crachás, que referenciam outra
 * entidade por id.
 */
export function useOpcoes(tipo, formatarLabel) {
  const [opcoes, setOpcoes] = useState([]);

  useEffect(() => {
    let cancelado = false;

    pesquisar(tipo)
      .then((dados) => {
        if (!cancelado) {
          setOpcoes(dados.map((registro) => ({ value: registro._id, label: formatarLabel(registro) })));
        }
      })
      .catch((err) => console.error(`Não foi possível carregar opções de ${tipo}:`, err));

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  return opcoes;
}
