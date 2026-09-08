/**
 * Catálogo oficial de Assimilações.
 * Fonte: Assimilacoes.pdf, páginas impressas 126-162.
 *
 * O catálogo é deliberadamente estático: a aplicação não possui banco de
 * dados para esta referência e os registros abaixo são a fonte única usada
 * pela página da campanha.
 */
export const assimilationFamilies = ["evolutive", "adaptive", "inopportune", "singular"];

export const assimilationFamilyLabels = {
  evolutive: "Evolutiva",
  adaptive: "Adaptativa",
  inopportune: "Inoportuna",
  singular: "Singular",
};

export const assimilationCatalogStatus = {
  sourceFile: "Assimilacoes.pdf",
  imported: true,
  message: "Catálogo oficial carregado a partir de Assimilacoes.pdf.",
};

const ability = (name, description, costText = "") => ({ name, description, ...(costText ? { costText } : {}) });

const assimilation = (family, level, rank, name, description, sourcePage, abilities) => {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `${family}-${slug}`,
    family,
    level,
    rank,
    name: `Assimilação ${name}`,
    description,
    sourcePage,
    abilities: abilities.map((item, index) => ({ id: `${family}-${slug}-ability-${index + 1}`, ...item })),
  };
};

export const officialAssimilations = [
  assimilation("evolutive", 1, "A", "Sensitiva", "O(a) Infectado(a) desenvolve uma percepção intuitiva para criaturas assimiladas e eventos futuros, navegando pelas tensões do ambiente usando o sexto sentido.", 126, [
    ability("Sensibilidade", "Gasta um ponto de Determinação para sentir a presença de criaturas assimiladas em até 30 metros pelo restante da cena."),
    ability("Consciência", "Mantém um dado adicional sempre que realizar um teste que inclua Percepção."),
    ability("Discernimento", "Adiciona um símbolo de adaptação à face de um dado mantido que já tenha pelo menos um sucesso em testes de Ação."),
    ability("Presciência", "No começo da sessão, rola dois dados do tipo escolhido e pode substituir resultados posteriores do mesmo tipo, uma vez cada dado.", "Assimilação 3+"),
    ability("Complicar", "Sempre que alguém realizar um teste na presença do(a) Infectado(a), pode gastar um ponto de Assimilação para escolher um dado e rolá-lo novamente, substituindo o resultado anterior.", "Assimilação 5+"),
    ability("Vidência", "Consegue prever Crises. Quando seria ativada, o(a) Assimilador(a) adia o efeito por até 24 horas para permitir contramedidas.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 2, "2", "Reativa", "Os reflexos do(a) Infectado(a) se tornam cada vez mais precisos, reagindo de forma instintiva e assertiva a perigos ou situações inusitadas.", 127, [
    ability("Ligeiro", "Recebe um ponto em Reação, podendo ultrapassar o limite máximo."),
    ability("Rápido", "Em testes que incluam Reação, pode gastar um ponto de Assimilação para adicionar um sucesso ao resultado."),
    ability("Preciso", "Em testes que incluam Reação, anula uma falha no resultado."),
    ability("Alígero", "Em testes que incluam Reação, substitui qualquer quantidade de adaptações por sucessos.", "Assimilação 3+"),
    ability("Hábil", "Em testes que incluam Reação, adiciona um sucesso ao resultado; pode ser ativado com Rápido, acumulando os efeitos.", "Assimilação 5+"),
    ability("Celeridade", "Em testes que incluam Reação, substitui todas as falhas por adaptações.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 3, "3", "Sensorial", "Os sentidos do(a) Infectado(a) atingem níveis extraordinários, captando detalhes sutis com precisão.", 127, [
    ability("Perceptivo", "Recebe um ponto em Percepção, podendo ultrapassar o limite máximo."),
    ability("Alerta", "Em testes que incluam Percepção, pode gastar um ponto de Assimilação para adicionar sucessos ao resultado."),
    ability("Detalhista", "Em testes que incluam Percepção, anula falhas no resultado."),
    ability("Meticuloso", "Em testes que incluam Percepção, substitui qualquer quantidade de adaptações por sucessos.", "Assimilação 3+"),
    ability("Arguto", "Em testes que incluam Percepção, adiciona um sucesso; pode ser ativado com Alerta, acumulando os efeitos.", "Assimilação 5+"),
    ability("Intuitivo", "Em testes que incluam Percepção, substitui todas as falhas por adaptações.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 4, "4", "Vigorosa", "A resiliência física e mental do(a) Infectado(a) é reforçada. Corpo e mente são capazes de resistir a pressões e traumas.", 128, [
    ability("Resoluto", "Recebe um ponto em Resolução, podendo ultrapassar o limite máximo."),
    ability("Resistente", "Em testes que incluam Resolução, pode gastar um ponto de Assimilação para adicionar sucessos ao resultado."),
    ability("Firme", "Em testes que incluam Resolução, anula falhas no resultado."),
    ability("Vigoroso", "Em testes que incluam Resolução, pode substituir adaptações por sucessos.", "Assimilação 3+"),
    ability("Persistente", "Em testes que incluam Resolução, adiciona um sucesso; pode ser ativado com Resistente, acumulando os efeitos.", "Assimilação 5+"),
  ]),
  assimilation("evolutive", 5, "5", "Persuasiva", "O carisma e a influência do(a) Infectado(a) se ampliam, facilitando a comunicação e o convencimento e ampliando seu magnetismo e autoridade.", 128, [
    ability("Influente", "Recebe um ponto em Influência, podendo ultrapassar o limite máximo."),
    ability("Persuasivo", "Em testes que incluam Influência, pode gastar um ponto de Assimilação para adicionar sucessos ao resultado."),
    ability("Convincente", "Em testes que incluam Influência, anula falhas no resultado."),
    ability("Magnético", "Em testes que incluam Influência, substitui qualquer número de adaptações por sucessos.", "Assimilação 3+"),
    ability("Carismático", "Em testes que incluam Influência, adiciona um sucesso; pode ser ativado com Persuasivo, acumulando os efeitos.", "Assimilação 5+"),
    ability("Majestoso", "Em testes que incluam Influência, substitui todas as falhas por adaptações.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 6, "6", "Brutal", "A capacidade do(a) Infectado(a) em empregar força bruta e gerar aceleração é aumentada, alcançando proeza física sobre-humana.", 128, [
    ability("Forte", "Recebe um ponto em Potência, podendo ultrapassar o limite máximo."),
    ability("Robusto", "Em testes que incluam Potência, pode gastar um ponto de Assimilação para adicionar sucessos ao resultado."),
    ability("Pujante", "Em testes que incluam Potência, anula falhas no resultado."),
    ability("Potente", "Em testes que incluam Potência, pode substituir adaptações por sucessos.", "Assimilação 3+"),
    ability("Agressivo", "Em testes que incluam Potência, adiciona um sucesso; pode ser ativado com Robusto, acumulando os efeitos.", "Assimilação 5+"),
    ability("Devastador", "Em testes que incluam Potência, substitui todas as falhas por adaptações.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 7, "7", "Perspicaz", "O raciocínio e a cognição do(a) Infectado(a) são aprimorados, despertando genialidade, conexões ocultas e soluções brilhantes.", 129, [
    ability("Sagaz", "Recebe um ponto em Sagacidade, podendo ultrapassar o limite máximo."),
    ability("Mente Assimilada", "Em testes que incluam Sagacidade, pode gastar um ponto de Assimilação para adicionar sucessos ao resultado."),
    ability("Perfeccionista", "Em testes que incluam Sagacidade, anula falhas no resultado."),
    ability("Solerte", "Em testes que incluam Sagacidade, pode substituir adaptações por sucessos.", "Assimilação 3+"),
    ability("Potência Mental", "Em testes que incluam Sagacidade, adiciona um sucesso; pode ser ativado com Mente Assimilada, acumulando os efeitos.", "Assimilação 5+"),
    ability("Genialidade", "Em testes que incluam Sagacidade, substitui todas as falhas por adaptações.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 8, "8", "Regenerativa", "A capacidade regenerativa do corpo do(a) Infectado(a) é ampliada além dos limites humanos.", 130, [
    ability("Resistente", "Ignora a penalidade do nível 4 de Saúde (Laceração)."),
    ability("Resiliente", "Pode se regenerar sem ajuda médica mesmo quando reduzido ao nível 2 (Debilitação) no tempo de recuperação de uma semana."),
    ability("Vigoroso", "Recebe um sucesso adicional em cada ponto de Saúde."),
    ability("Restauração", "Ao concluir uma Recuperação, dobra os pontos de Saúde regenerados.", "Assimilação 3+"),
    ability("Recuperação", "Regenera uma quantidade de Saúde igual à soma de Resolução e Potência após cada cena.", "Assimilação 5+"),
    ability("Reintegração", "É capaz de se regenerar completamente em apenas um dia, desde que não perca seu último ponto de Saúde.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 9, "9", "Silvestre", "A conexão do(a) Infectado(a) com a natureza se aprofunda, permitindo curar, comandar animais e modificar ambientes vivos.", 130, [
    ability("Sintonia Natural", "Recebe um ponto em Biologia, podendo ultrapassar o limite máximo."),
    ability("Cura Verde", "Pode gastar um ponto de Determinação para reavivar vegetação morta ou severamente danificada a até cinco metros."),
    ability("Fotossíntese", "Realiza fotossíntese completa e não precisa consumir alimentos; necessita de água, solo e duas horas de luz solar diária."),
    ability("Animalismo", "Ao realizar um teste para influenciar o comportamento de animais, adiciona sucessos ao resultado.", "Assimilação 3+"),
    ability("Refúgio Natural", "Estabelece um Refúgio Vivo em área natural equivalente a um Refúgio de Nível 4.", "Assimilação 5+"),
    ability("Gênese", "Gasta todos os pontos de Assimilação para fazer flora e fauna locais crescerem violentamente em um raio de um quilômetro por ponto gasto.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 10, "10", "Opressora", "A presença do(a) Infectado(a) deixa seus rivais acuados, hesitantes e mais suscetíveis à dominância.", 131, [
    ability("Aproveitador", "Em testes que incluam Influência, adiciona um sucesso se o alvo estiver em posição de inferioridade ou dúvida."),
    ability("Sugestão", "Gasta um ponto de Assimilação para forçar um alvo hesitante a seguir uma sugestão simples, sem risco ou dano a pessoas importantes.", "Assimilação 2"),
    ability("Condicionamento", "Após um teste bem-sucedido que inclua Influência, pode repetir a mesma frase ou comando para outro alvo da cena."),
    ability("Imposição", "Mantém um dado adicional em testes que incluam Influência em locais pacíficos.", "Assimilação 3+"),
    ability("Mesmerizar", "Ao obter sucessos suficientes em um teste de Influência, impõe uma condição narrativa ao alvo até o fim da cena.", "Assimilação 5+"),
    ability("Dominância", "Adiciona seus pontos de Expressão à Defesa de seu Refúgio.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 11, "J", "Esquia", "A motricidade do(a) Infectado(a) é adaptada para interagir de forma mais eficiente com o ambiente, auxiliando a ocultação.", 131, [
    ability("Infiltrador", "Em testes que incluam Furtividade em ambiente urbano ou construído, adiciona um sucesso ao resultado."),
    ability("Pulso Sombrio", "Gasta um ponto de Assimilação para anular o resultado em um teste que inclua Furtividade."),
    ability("Esquio", "Após executar Ação de Fuga do Conflito, outro alvo deve ser escolhido se o(a) Infectado(a) não for o único alvo viável."),
    ability("Subterfúgio", "Só precisa de um sucesso para ter êxito em qualquer teste que inclua Furtividade fora de Conflito.", "Assimilação 3+"),
    ability("Auxílio das Sombras", "Adiciona sucessos à face de cada dado de Furtividade mantido; dados mantidos de outras Aptidões não recebem o benefício.", "Assimilação 5+"),
    ability("Ofuscação", "Adiciona sucessos à face de todos os dados em testes que incluam Furtividade.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 12, "Q", "Indomável", "A perseverança do(a) Infectado(a) supera seus limites, permitindo que continue lutando mesmo nas condições mais adversas.", 132, [
    ability("Fôlego Raro", "Adiciona sucessos ao resultado em testes que incluam Atletismo com esforço contínuo."),
    ability("Perseverança", "Gasta um ponto de Assimilação para manter clareza e força de vontade ao entrar no Estado Suscetível."),
    ability("Disposição", "Sempre que realizar um teste que inclua Atletismo, mantém um dado adicional."),
    ability("Obstinação", "Ao obter sucessos suficientes em um teste de Atletismo, restaura um ponto de Determinação no fim da cena.", "Assimilação 3+"),
    ability("Irredutível", "Gasta dois pontos de Determinação para ignorar qualquer penalidade decorrente da redução de Saúde.", "Assimilação 5+"),
    ability("Intrépido", "É imune a qualquer efeito que gere penalidades externas ou o impeça de agir normalmente.", "Assimilação 7+"),
  ]),
  assimilation("evolutive", 13, "K", "Primordial", "O DNA do(a) Infectado(a) integra a essência da Assimilação e interage com a própria força evolutiva e com as Assimilações ao redor.", 133, [
    ability("Primal", "O primeiro ponto de Assimilação utilizado pelo(a) Infectado(a) em cada cena de Conflito é gratuito."),
    ability("Supressor", "Gasta um ponto de Assimilação para anular uma falha no resultado de qualquer teste em Conflito."),
    ability("Subjugar", "Em Conflitos, quando investe pontos em Neutralizar Ameaça e tem maior nível que o alvo, aumenta o resultado."),
    ability("Proeza", "Gasta dois pontos de Assimilação para substituir o nível no Instinto selecionado pelo próprio nível de Assimilação.", "Assimilação 3+"),
    ability("Sinergia", "Consegue pagar custos de Assimilação utilizados por aliados.", "Assimilação 5+"),
    ability("Poder Inesgotável", "Não gasta Assimilação para as próprias ativações.", "Assimilação 7+"),
  ]),

  assimilation("adaptive", 1, "A", "Anatômica", "Transformações físicas profundas moldam o corpo para combate e deslocamento, mas distorcem a alimentação e a motricidade fina.", 134, [
    ability("Presas Aumentadas", "Gasta Determinação para usar a característica Letal ao morder; depois de ingerir carne crua, ignora o custo por quatro horas."),
    ability("Nadadeiras", "Gasta Assimilação para se deslocar debaixo d'água na velocidade normal; perde um nível em Furtividade."),
    ability("Guelras", "Permitem respirar debaixo d'água, mas consome o dobro de água."),
    ability("Braços Alongados", "Aumenta o alcance e faz o alvo perder falhas no turno seguinte ao investir em Neutralizar Ameaça; perde um nível em Manufaturas.", "Assimilação 3+"),
    ability("Poder de Carga", "Carrega o triplo da carga normal e dobra os pontos investidos em Neutralização de Ameaça; perde permanentemente níveis em Manufaturas.", "Assimilação 5+"),
    ability("Nado", "Desenvolve asas de queratina orgânica capazes de voo pleno, mas não pode usar coletes, mochilas ou roupas que cubram os ombros.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 2, "2", "Cutânea", "A pele ganha novas capacidades que auxiliam o corpo, mas dificultam sua interação com o ambiente.", 135, [
    ability("Pele Aderente", "Pode aderir a superfícies verticais e mover-se por paredes ou tetos sem testes de Atletismo; sofre penalidade em Fuga correndo."),
    ability("Pele Ajustável", "Em baixa luz, mantém um dado a mais em testes que incluam Furtividade; sofre penalidade em Expressão sob luz direta."),
    ability("Sentir Vibrações", "Adiciona sucessos em testes que incluam Percepção tátil; estímulos inesperados reduzem testes que incluam Reação."),
    ability("Cheiro Nocivo", "A pele libera compostos químicos que geram penalidades a seres vivos próximos e reduzem testes sociais.", "Assimilação 3+"),
    ability("Mimetismo", "Controla pequenas alterações de cor e calor para adicionar dados em um teste de Furtividade, disfarce ou atuação corporal por cena.", "Assimilação 5+"),
    ability("Pele Sensorial", "Detecta sinais elétricos, temperatura e vibrações em um raio de três quilômetros, mas queima sob sol direto.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 3, "3", "Camaleônica", "O(a) Infectado(a) desenvolve camuflagem natural e ajusta sua aparência ao ambiente e aos outros, mas perde controle sobre impulsos visuais.", 136, [
    ability("Camaleônico", "A pigmentação pode fundir-se ao ambiente; adiciona dados em Furtividade ao permanecer imóvel e perde Determinação ao sofrer queimadura solar."),
    ability("Camuflagem", "Adapta-se reflexivamente a padrões visuais externos para ocultar o corpo; os dados de Furtividade são substituídos por Sagacidade."),
    ability("Visão Periférica", "Recebe um ponto em Percepção, podendo ultrapassar o limite máximo, mas reduz a visão de profundidade."),
    ability("Malemolência", "Adapta a aparência ao humor e adiciona dados em interações sociais, exceto ao esconder informações.", "Assimilação 5+"),
    ability("Invisibilidade", "Gasta Assimilação para ficar completamente invisível pelo restante da cena e não pode voltar a ficar visível antes disso.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 4, "4", "Escamosa", "Escamas cobrem o corpo do(a) Infectado(a), fortalecendo sua resistência e atrapalhando a forma de reagir ao redor.", 136, [
    ability("Escamoso", "Escamas reduzem em um o dano cortante sofrido, mas penalizam Expressão com pessoas que desconhecem Assimilações."),
    ability("Escalador", "Escamas nas mãos e pés permitem andar ou escalar superfícies ásperas, mantendo dado adicional em Atletismo; perde dado em Furtividade urbana."),
    ability("Escorregadio", "Escamas melhoram a locomoção em superfícies instáveis ou escorregadias; sofre dano dobrado de troca de pele mensal."),
    ability("Escamas Reativas", "As escamas endurecem ao toque e causam dano a quem atacar ou adicionam dados à Neutralização de Ameaça.", "Assimilação 3+"),
    ability("Evasão Natural", "Ao ser alvejado, causa penalidade ao atacante, aumentando custo de ativações ou anulando parte do resultado.", "Assimilação 5+"),
    ability("Imunidade ao Calor", "É imune a dano térmico, mas fica reluzente sob iluminação artificial e sofre penalidade em Furtividade.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 5, "5", "Óssea", "Mutações no sistema ósseo alteram estrutura e composição para exceder os limites humanos, trazendo novos desafios anatômicos.", 137, [
    ability("Ossos Reativos", "Espículos ósseos causam dano ao agressor quando sofre golpe corpo a corpo, mas penalizam testes de Expressão."),
    ability("Maleabilidade", "Articulações em ângulos incomuns mantêm dado adicional em Furtividade, mas penalizam Atletismo ligado a postura ou equilíbrio."),
    ability("Lâminas Ósseas", "Projeta lâminas ósseas nos antebraços ou joelhos e adiciona dados em testes físicos."),
    ability("Presas de Mamute", "Cria presas de mamute; em Conflito, adiciona dados e reduz falhas ao Neutralizar Ameaça.", "Assimilação 3+"),
    ability("Exoesqueleto", "Por três pontos de Assimilação, projeta ossos para ignorar dano cortante ou perfurante até o fim da cena, mas não pode falar.", "Assimilação 5+"),
    ability("Gigante", "Por quatro pontos de Assimilação, dobra de tamanho e mantém dois dados adicionais em testes físicos, mas sofre penalidades em Furtividade e Percepção.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 6, "6", "Gastrointestinal", "O sistema digestivo consome uma ampla variedade de nutrientes, mas exclui a dieta humana, o prazer na alimentação e pode gerar desconfortos.", 138, [
    ability("Saliva Ácida", "Consome matéria orgânica, mas o odor dos ácidos estomacais gera penalidade em Influência."),
    ability("Ruminante", "Estômago segmentado armazena alimento por até uma semana, mas exige comer alimento fresco."),
    ability("Estômago Restaurador", "Regenera Saúde por refeição completa, mas não consegue comer comida processada."),
    ability("Jato", "Pode expelir ácido contra um alvo, causando dano e aumentando custos ou reduzindo resultados conforme o caso."),
    ability("Imunidade à Intoxicação", "Não sofre intoxicação ou envenenamento, mas não restaura Determinação com comidas especiais.", "Assimilação 3+"),
  ]),
  assimilation("adaptive", 7, "7", "Respiratória", "O controle respiratório é aprimorado para sobreviver em ambientes hostis, mas perturba a comunicação e amplifica reações sensoriais.", 138, [
    ability("Pulmão Grosso", "Respira ar rarefeito, fumaça ou detritos sem penalidades, mas sua respiração ruidosa penaliza Furtividade."),
    ability("Fôlego Bom", "Prende a respiração por até cinco minutos; odores fortes ou ataques ao olfato reduzem Determinação."),
    ability("Fôlego Poderoso", "Gasta Assimilação para expirar com pressão torácica, empurrar uma Ameaça ou cobri-la de poeira.", "Assimilação 1"),
    ability("Fôlego Inumano", "Pode Agir por Instinto sem custo de Assimilação, mas sofre penalidade em Conhecimentos.", "Assimilação 3+"),
    ability("Fôlego Reparador", "O controle respiratório restaura o equilíbrio e mantém dois dados adicionais em ações físicas até o fim da cena.", "Assimilação 5+"),
    ability("Fôlego Infinito", "Sobrevive sem ar por tempo indefinido e dobra qualquer efeito de veneno ou intoxicação.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 8, "8", "Termorreguladora", "O corpo regula o calor com precisão, alterando o ambiente ao redor, mas exige cautela com toques, desgastes e equilíbrio térmico.", 139, [
    ability("Resistência Térmica", "Frio ou calor moderados não afetam o corpo, mas o contato físico prolongado penaliza testes até o fim da cena."),
    ability("Conduzir Calor", "Absorve parte do calor do ambiente e aquece objetos ou pessoas; sem fontes térmicas, sua Regeneração é reduzida."),
    ability("Calor", "Gasta Assimilação para aumentar a temperatura do ambiente, penalizando Resolução ou Potência e aumentando custos de Ameaças."),
    ability("Sangue Quente", "Mantém dois dados adicionais em testes que incluam Reação.", "Assimilação 3+"),
    ability("Exala Vapor", "Emite vapor que ofusca adversários; ataques de longo alcance na área sofrem penalidades.", "Assimilação 5+"),
    ability("Esquentar/Esfriar Região", "Gasta todos os pontos de Assimilação para alterar a temperatura de uma região, três graus Celsius por ponto.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 9, "9", "Neural", "Sinapses hiperativas decifram padrões e ameaças com precisão inumana, à custa do descanso, do afeto e da paz mental.", 140, [
    ability("Pulso Mental", "Gasta Assimilação para repetir um teste que inclua Conhecimentos, mantendo o segundo resultado; a recuperação exige ambiente isolado."),
    ability("Prever Dano", "Ao ser alvejado por um segundo efeito danoso, reduz o dano sofrido em um ponto, mas perde Determinação sob estímulos simultâneos."),
    ability("Prever Ameaça", "Gasta Assimilação para antecipar uma Ameaça, rolando Reação ou Sagacidade e reservando resultados para anulá-la.", "Assimilação 1"),
    ability("Sintonia Mental", "Prevê falhas em ações de outros Infectados e adiciona dados ao teste de um aliado fora de Conflito, mas penaliza interações sociais.", "Assimilação 3+"),
    ability("Visão Mental", "Ao obter sucessos em Conhecimento, adquire uma informação confiável sobre o tema, mas recebe penalidade em rolagens criativas.", "Assimilação 5+"),
    ability("Visão Verdadeira", "Gasta Assimilação para pedir uma informação oculta ao Assimilador; profundidade e relevância aumentam por ponto gasto.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 10, "10", "Cardiovascular", "O(a) Infectado(a) controla o coração ao extremo, melhorando a resposta a crises, mas podendo passar por instabilidades ao longo do dia.", 141, [
    ability("Sangue Frio", "Não sofre penalidades em situações de tensão, medo ou risco, mas penaliza Manufaturas."),
    ability("Transe", "Restaura o dobro da quantidade normal de Determinação em Recuperações realizadas com a Saúde completa."),
    ability("Sangue Furioso", "Gasta Determinação para manter dois dados adicionais em Potência ou Atletismo; perde um no fim da rodada."),
    ability("Fingir Morte", "Reduz o fluxo sanguíneo quase parando o coração por até cinco minutos."),
    ability("Sangue Regenerativo", "Gasta Determinação para manter um dado adicional e Regenera Saúde, mas não pode anular falhas.", "Assimilação 5+"),
    ability("Sangue Potente", "Gasta toda a Assimilação para manter um dado adicional por ponto gasto em Ações físicas pelo restante da cena.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 11, "J", "Fitomórfica", "A fusão com o mundo vegetal transforma o corpo em raiz, escudo e fonte de cura, desde que jamais perca o contato com o solo.", 142, [
    ability("Sintonia Verde", "Sente a presença, o tipo e a condição de plantas num raio de 30 metros quando estiver descalço no solo."),
    ability("Casca Grossa", "A casca vegetal aumenta Resolução, mas dobra o dano de queimaduras."),
    ability("Fotorreceptores", "Realiza fotossíntese e não precisa consumir alimentos, desde que tenha água, solo e luz solar."),
    ability("Raízes", "Extrai água e nutrientes do solo e mantém estabilidade em terrenos difíceis; dormir sem contato com o solo impede restaurar Determinação.", "Assimilação 3+"),
    ability("Curar o Solo", "Reduz um ponto completo de Assimilação para nutrir um bioma, removendo contaminações e restaurando flora.", "Assimilação 5+"),
    ability("Cura Comunal", "Gasta dois pontos de Assimilação para tornar o terreno regenerativo; aliados que tocarem o solo regeneram Saúde por rodada.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 12, "Q", "Quimiorreceptora", "O olfato evolui para ler rastros, mentiras e histórias químicas, mas torna o mundo um tormento sensorial.", 142, [
    ability("Faro Apurado", "Identifica substâncias simples e percebe odores residuais, feromônios, álcool ou putrefação; odores intensos causam desconforto."),
    ability("Detecção Química", "Distingue compostos orgânicos e detecta agentes tóxicos antes de ingerir, tocar ou inalar; comidas muito temperadas impedem restauração."),
    ability("Farejar Rastros", "Analisa rastros e marcadores químicos residuais e adiciona dados ao analisar um local; ambientes novos penalizam Percepção."),
    ability("Farejar Sentimentos", "Detecta alterações hormonais e pode gastar Assimilação para perceber nuances emocionais de um alvo.", "Assimilação 3+"),
    ability("Secreções", "Libera secreções para marcar trilha, objeto ou personagem e seguir o odor por 24 horas.", "Assimilação 5+"),
    ability("Farejar Psicometria", "Gasta três pontos de Assimilação para ler o estado químico de uma área, estrutura, objeto ou cadáver e receber uma revelação precisa.", "Assimilação 7+"),
  ]),
  assimilation("adaptive", 13, "K", "Metabólica", "Um metabolismo fora de controle gera força, cura e resistência, mas cobra energia constante e consome o corpo de dentro para fora.", 143, [
    ability("Metabolismo Acelerado", "Ao regenerar Saúde, recupera um ponto adicional; precisa consumir o triplo de calorias ou perde Saúde diariamente."),
    ability("Metabolismo Afiado", "Converte gordura e músculos em energia e mantém dado adicional em ações de Reação ou Potência."),
    ability("Metabolismo Regenerativo", "Gasta dois pontos de Determinação para acelerar a Recuperação, regenerando quatro pontos de Saúde e sofrendo penalidade em testes físicos.", "Assimilação 3+"),
    ability("Imunidade Metabólica", "Resiste a condições extremas, mas precisa ingerir sais e eletrólitos diariamente para não acumular penalidades.", "Assimilação 3+"),
    ability("Metabolismo Eficiente", "Gasta Assimilação para manter dois dados adicionais em teste físico; perde Determinação após a Ação.", "Assimilação 5+"),
    ability("Metabolizar Instintos", "Gasta toda a Assimilação e distribui os pontos entre Potência, Reação e Resolução, sofrendo dano por rodada até o fim do efeito.", "Assimilação 7+"),
  ]),

  assimilation("inopportune", 1, "A", "Atrofiante", "Músculos e tendões definham; o corpo se move em esforço contido, aprendendo a sobreviver com menos, sempre à beira de ruir.", 144, [
    ability("Rigidez Muscular", "A degeneração causa rigidez muscular que penaliza testes que incluam Potência."),
    ability("Rigidez Articular", "A rigidez nas articulações limita movimentos contínuos e penaliza Potência ou Atletismo em corrida, escalada ou natação."),
    ability("Nervos Atrofiados", "Atinge terminações nervosas periféricas e penaliza testes que incluam Reação para reagir a estímulos rápidos."),
    ability("Digestão Ineficaz", "Exige comer constantemente em pequenas quantidades; porções maiores são regurgitadas e a Recuperação perde efeito."),
    ability("Atrofia Muscular", "Ao falhar em teste que inclua Potência ou Resolução, sofre dano à Saúde por falha mantida."),
    ability("Falência", "Todo dano físico e todas as penalidades de Saúde são dobrados contra o(a) Infectado(a)."),
  ]),
  assimilation("inopportune", 2, "2", "Neuropática", "Nervos disparam sinais confusos: dor fantasma, tremores e reflexos tardios tornam o corpo uma marionete de si mesmo.", 145, [
    ability("Debilidade", "A falha neural reduz o equilíbrio elétrico dos neurônios motores e penaliza testes que incluam Atletismo."),
    ability("Tremores", "Perde um dado adicional sempre que realizar um teste que inclua Reação."),
    ability("Desorientação", "Testes que incluam Percepção ou Sobrevivência envolvendo distância ou direção sofrem penalidade."),
    ability("Fragilidade", "Ao sofrer dano físico direto, perde Determinação; se o dano reduzir sua Saúde, perde dois pontos."),
    ability("Inaptidão", "Durante Conflitos, todas as Ações sofrem penalidades adicionais.", "Saúde 10"),
  ]),
  assimilation("inopportune", 3, "3", "Devoradora", "O metabolismo exige alimento constante; quando negado, devora as reservas internas, corroendo a carne, a paciência e o foco.", 146, [
    ability("Coeficiente Calórico", "Após quatro horas sem comer, sofre penalidade em todos os testes até saciar a fome."),
    ability("Ignorância", "Após duas horas sem comer, sofre penalidade em testes que incluam Conhecimentos."),
    ability("Desarticulação", "Após duas horas sem comer, sofre penalidade adicional em qualquer teste que inclua Influência."),
    ability("Apetite Corrosivo", "Após seis horas sem ingerir alimento orgânico, perde Saúde; o dano aumenta a cada hora."),
    ability("Ânsia Terrível", "Após duas cenas sem se alimentar, perde o controle para a fome e só pode agir para ingerir matéria orgânica."),
  ]),
  assimilation("inopportune", 4, "4", "Secretora", "Glândulas hiperativas liberam fluidos e odores; funcionam como defesa instintiva, mas denunciam a presença e afastam aliados.", 146, [
    ability("Mal Odor", "Secreta substância pegajosa e de odor forte, penalizando Expressão em ambientes fechados ou pouco ventilados."),
    ability("Inchaço Debilitante", "Gordura e umidade acumuladas dificultam manipular objetos delicados, penalizando Manufaturas e Armas."),
    ability("Escorregadio", "A secreção forma um filme que compromete equilíbrio e tração, penalizando Atletismo em superfícies instáveis."),
    ability("Fragilidade Térmica", "Em ambientes extremos, dobra a penalidade aplicada pela secreção à regulação térmica."),
    ability("Inflamável", "A secreção pega fogo e causa dano à Saúde por falha; o fogo também remove a secreção pelo restante da cena."),
    ability("Bufotoxina", "Qualquer toque causa dano; dormir no mesmo cômodo exige teste de Resolução com Medicina das outras personagens."),
  ]),
  assimilation("inopportune", 5, "5", "Calcificante", "Placas endurecidas formam ossos rígidos; roubam mobilidade, impõem rigidez crescente e atrapalham a agilidade.", 147, [
    ability("Endurecido", "Ligamentos endurecidos penalizam Furtividade ou Atletismo em ações que exigem leveza ou equilíbrio."),
    ability("Descoordenado", "Formações ósseas em articulações penalizam cada Ação com múltiplos movimentos corporais sucessivos."),
    ability("Hesitante", "A calcificação chega à coluna e, em testes de Fuga, cancela metade dos sucessos mantidos."),
    ability("Travado", "Cada falha mantida em Potência ou Reação em Conflito aumenta a quantidade de sucessos necessários para a Fuga."),
    ability("Combalido", "A rigidez articular substitui sucessos por falhas em todos os testes físicos."),
    ability("Condrocalcinose", "A calcificação severa reduz em um todos os testes físicos."),
  ]),
  assimilation("inopportune", 6, "6", "Fotossensível", "Luz e claridade tornam-se agressivas; pele e olhos reagem mal ao ambiente e exigem isolamento.", 148, [
    ability("Visão Sensível", "Sob luz intensa, sofre penalidade em testes que incluam Percepção."),
    ability("Pele de Vampiro", "Após mais de trinta minutos sob luz solar direta, perde Determinação."),
    ability("Enxaqueca", "Após uma cena inteira em local iluminado, não restaura Determinação na próxima Recuperação."),
    ability("Visão Noturna", "Ao sair de ambiente escuro para iluminado ou vice-versa, sofre penalidade nos testes das primeiras rodadas."),
    ability("Carapaça Disforme", "Sofre penalidade permanente em ataques de longo alcance e testes de ataque baseados em profundidade."),
    ability("Visão Total", "Só enxerga na ausência total de luz; qualquer luz força testes com Percepção e impõe penalidade.", "Saúde 6"),
  ]),
  assimilation("inopportune", 7, "7", "Litodérmica", "A pele transforma-se em uma mistura metálica que endurece, reflete a luz, afeta a interação e alcança o sangue.", 149, [
    ability("Afasta Animais", "O odor ferroso provoca reações defensivas; interações com animais sofrem penalidade."),
    ability("Ossos Frágeis", "Cristais minerais nos ossos comprometem a absorção de impacto; todo dano de impacto é aumentado."),
    ability("Eletrossensível", "Dano elétrico é dobrado e dano por calor ou queimadura faz perder Determinação."),
    ability("Carapaça Disforme", "Formações minerais atravessam a derme e impedem vestir roupas estruturadas ou armaduras rígidas."),
    ability("Muco Oxidante", "Resíduos oxidados enferrujam equipamentos metálicos em contato com o corpo e reduzem sua Qualidade."),
    ability("Fígado Estragado", "Exige tratamento semanal com sangria; sem tratamento, desenvolve cirrose e perde Saúde por semana."),
  ]),
  assimilation("inopportune", 8, "8", "Entorpecida", "Os sentidos se arrastam, amortecidos; há proteção contra a dor, mas a reação e a orientação são distorcidas.", 150, [
    ability("Agorafobia", "Em áreas externas ou grandes espaços, testes que incluam Percepção sofrem penalidade."),
    ability("Sensibilidade Auditiva", "Sons repentinos ou altos causam vertigem ou desorientação e fazem perder Determinação."),
    ability("Sentidos Sobrecarregados", "Múltiplos estímulos sensoriais intensos penalizam todas as Ações."),
    ability("Desorientação Aguda", "O desgaste dos sentidos penaliza testes que incluam Percepção ou Reação."),
    ability("Devaneios", "Uma vez por sessão, o Assimilador pode introduzir um estímulo falso em momentos de tensão, reduzindo o resultado do teste."),
    ability("Dessensibilização Aguda", "Perde a maior parte dos sentidos e todos os níveis em Percepção até que a mutação seja anulada.", "Saúde 10"),
  ]),
  assimilation("inopportune", 9, "9", "Aberrante", "Tecidos e órgãos redundantes surgem sem harmonia; aumentam o consumo e reduzem a eficiência da fisiologia.", 151, [
    ability("Anomorfia", "Um órgão ou tecido desnecessário reduz em um ponto um Instinto escolhido pelo jogador."),
    ability("Pernas Disformes", "A má formação nas pernas reduz mobilidade, penaliza Atletismo e pode transformar sucessos em falhas."),
    ability("Aberração", "O corpo muda para uma aparência retorcida e malformada, podendo alterar inclusive o número de membros."),
    ability("Hipersensibilidade", "Tecidos e órgãos redundantes tornam o toque agressivo; ao ser tocado firmemente ou sofrer dano, perde Determinação."),
    ability("Recuperação Debilitada", "As Recuperações restauram apenas metade de Saúde e Determinação, arredondada para cima."),
    ability("Descoordenação", "Partes do corpo operam de forma autônoma e não coordenada; qualquer sucesso obtido pode transformar-se em falha."),
  ]),
  assimilation("inopportune", 10, "10", "Hipersensível", "O mundo se torna áspero e invasivo, especialmente para o(a) Infectado(a), que sofre com dor e ruídos intensos.", 151, [
    ability("Vulnerabilidade a Dor", "Ao sofrer dano físico, sofre penalidade no próximo teste que inclua Potência, Reação ou Resolução."),
    ability("Vulnerabilidade Emocional", "Ao receber crítica, provocação ou escárnio, sofre penalidade em todos os testes pelo restante da cena."),
    ability("Dor Degradante", "Dano físico por ataque corpo a corpo faz perder Determinação."),
    ability("Sensibilidade Radical", "Barulho intenso, temperatura extrema ou iluminação incômoda penalizam Conhecimentos e Expressão."),
    ability("Recuperação Sensível", "Recuperações perdem eficácia quando o repouso não ocorre em ambiente controlado."),
    ability("Sensibilidade Extrema", "Três ou mais fontes simultâneas de estímulo fazem perder Saúde e Determinação e limitam dados mantidos."),
  ]),
  assimilation("inopportune", 11, "J", "Mioclônica", "Espasmos e tiques rompem o controle; movimentos erráticos minam a sutileza e inviabilizam a precisão.", 152, [
    ability("Espasmos Involuntários", "Um sucesso em uma rolagem pode provocar pequeno espasmo ou reação involuntária narrada pelo Assimilador."),
    ability("Aflição Grave", "Em Cena de Conflito, sofre penalidade em qualquer Ação que requeira controle corporal."),
    ability("Movimentos Involuntários", "Ao entrar em uma nova cena, um membro é escolhido aleatoriamente e todas as ações que dependam dele são penalizadas."),
    ability("Barulhos Involuntários", "Em calma ou silêncio absoluto, emite sons que anulam tentativas de surpresa, camuflagem ou emboscada."),
    ability("Agitação Constante", "Não consegue permanecer imóvel por mais de um minuto; repousar ou aguardar faz perder Determinação."),
    ability("Debilidade Extrema", "Em qualquer teste físico, sofre penalidade adicional e descarta a face de dado com maior número de sucessos após cada rolagem."),
  ]),
  assimilation("inopportune", 12, "Q", "Disfásica", "A fala se rompe em falhas rápidas; a voz fica irregular e símbolos e palavras se confundem durante a comunicação.", 153, [
    ability("Desvio de Fala", "Em momentos de tensão, lapsos de linguagem podem trocar palavras, causar gagueira ou silêncio repentino."),
    ability("Fala Debilitada", "Diálogos complexos ou com personagens do Assimilador penalizam Expressão e Influência."),
    ability("Memória Debilitada", "Não consegue repetir corretamente instruções ou relatos com mais de uma frase; o conteúdo chega truncado ou alterado."),
    ability("Fala Simplificada", "Não pronuncia corretamente nomes próprios, números ou conceitos técnicos e penaliza Conhecimentos quando a fala é necessária."),
    ability("Letra Ilegível", "Ao tentar se comunicar por escrito, os símbolos se confundem, letras se embaralham e a mensagem não é compreendida."),
    ability("Comunicação Incompreensível", "Durante Conflitos ou grande tensão, perde a capacidade de produzir fala compreensível, salvo com ajuda externa."),
  ]),
  assimilation("inopportune", 13, "K", "Terminal", "As capacidades desaparecem enquanto a Assimilação toma o corpo do(a) Infectado(a) por completo.", 154, [
    ability("Pressão Estendida", "Penalidades persistem por uma cena adicional, mesmo depois que a causa original desaparece."),
    ability("Recuperação Sofrida", "Sempre que Regenerar Saúde, sofre um ponto de dano direto antes da Recuperação."),
    ability("Pressão por Fracasso", "Ao falhar em um teste, sofre penalidade no próximo teste; a penalidade acumula se continuar falhando."),
    ability("Aptidões Arruinadas", "No início de cada cena, uma Aptidão é escolhida aleatoriamente e rola como se não tivesse nível até o fim da cena."),
    ability("Determinação Hesitante", "Ao usar Determinação para manter dados adicionais, descarta automaticamente uma face do resultado."),
    ability("Inaptidão Extrema", "Todos os testes sofrem penalidade e perde permanentemente um ponto de uma Aptidão base até a mutação ser anulada."),
  ]),

  assimilation("singular", 1, "A", "do Bosque", "Permite regenerar-se em meio a árvores, mas longe de vegetação o corpo definha e exige contato com solo fértil.", 154, [
    ability("Embaúba", "A cada hora imóvel com pés ou mãos em contato com vegetação viva ou solo úmido, Regenera Saúde; sofrer dano interrompe o efeito."),
    ability("Eucalyptus", "Ao ser reduzido a Saúde 1 ou 2, pode permanecer imóvel por seis horas em solo fértil para recuperar como Saúde 3."),
    ability("Araucária", "Após mais de 24 horas sem contato com vegetação viva ou solo fértil, sofre penalidade em testes de Sobrevivência."),
  ]),
  assimilation("singular", 2, "2", "da Campina", "O corpo se adapta ao campo aberto: postura baixa, movimentos ágeis e percepção aguçada pelo vento e pelo solo.", 154, [
    ability("Alecrim", "Durante o dia, exposto à luz solar direta por uma hora, dobra toda a Determinação para dispensar alimentação e água por 24 horas."),
    ability("Cágado", "Enquanto exposto ao sol, recupera Determinação por cena; sofre dano adicional de calor ou luz intensa."),
    ability("Maria-da-campina", "A pele fotossintética não tolera ausência de luz natural; cada dia sem sol penaliza Resolução até restabelecer a exposição."),
  ]),
  assimilation("singular", 3, "3", "do Cerrado", "Casca grossa protege contra lesões e aridez; o organismo armazena água e recupera-se após longos períodos de seca.", 157, [
    ability("Tatu-canastra", "Sob sol forte ou clima seco, recebe proteção contra dano físico; perde o bônus em clima úmido, submerso ou chuva intensa."),
    ability("Mandacaru", "Quando sofre dois ou mais pontos de dano no mesmo ataque, a carapaça fere o atacante, mas exige tempo para regenerar."),
    ability("Porco-do-mato", "Ao correr, saltar ou escalar, sofre penalidade adicional em Furtividade por causa da rigidez dos movimentos."),
    ability("Jabuti-piranga", "Em ambientes planos e excessivamente nivelados, sofre menos penalidade em Reação até deixar o local ou adaptar-se."),
  ]),
  assimilation("singular", 4, "4", "da Colina", "Músculos e tendões se avolumam; a resistência prolonga-se em terrenos inclinados e o corpo economiza energia nas subidas.", 157, [
    ability("Caxinguelê", "Ignora penalidades de terreno inclinado, escorregadio ou irregular e não pode ser desequilibrado por meios físicos sem sofrer dano."),
  ]),
  assimilation("singular", 5, "5", "Desértica", "A umidade é prejudicial; o organismo reduz a necessidade de água e desenvolve maneiras de proteger-se do calor e de predadores.", 157, [
    ability("Suculenta", "Pode permanecer até cinco dias sem consumir água sem sofrer penalidades."),
    ability("Diabo-espinhoso", "Secreções irritam olhos e mucosas; agressores corpo a corpo sofrem dano e aliados próximos podem ser afetados."),
    ability("Esquilo Terrestre", "Passa a cavar buracos para dormir em segurança e perde Determinação se não dormir em uma toca."),
  ]),
  assimilation("singular", 6, "6", "Florestal", "O corpo aprimora equilíbrio e capacidade de se esgueirar em terrenos densos; visão e audição adaptam-se à penumbra.", 158, [
    ability("Morcego-narigudo", "Ignora penalidades por baixa luminosidade natural, mas o efeito não se aplica à escuridão total ou à ausência de luz artificial."),
    ability("Sucuri", "Os sons são absorvidos pela pele; recebe dados em Furtividade na vegetação densa, mas penaliza Expressão."),
    ability("Rato-do-mato", "Ao sair de ambiente sombreado para muito iluminado, sofre penalidade em Percepção por uma cena."),
  ]),
  assimilation("singular", 7, "7", "do Manguezal", "Poros filtram sal e membros adaptam-se ao lodo; o(a) Infectado(a) respira e se move em áreas encharcadas.", 158, [
    ability("Mangue-vermelho", "Pode consumir água salobra ou salina sem prejuízo."),
    ability("Caramujo-do-mangue", "Respira parcialmente pela pele em ambientes alagadiços e permanece submerso por tempo prolongado."),
    ability("Tartaruga-aruanã", "Em pisos rígidos, correr ou saltar penaliza Potência por causa do formato instável das extremidades."),
  ]),
  assimilation("singular", 8, "8", "Marinha", "Pulmões e músculos adaptam-se à pressão e correntes marinhas; nada com eficiência e tolera longas imersões.", 158, [
    ability("Pulmões e Músculos", "Nada com eficiência e tolera longas imersões, explorando o oceano sem risco de colapso."),
    ability("Toninha", "Move-se duas vezes mais rápido na água e não precisa testar Atletismo para nadar, exceto em tempestades ou redemoinhos."),
    ability("Biguá", "Recebe dados adicionais em Atletismo na água ou areia fofa e penaliza Manufaturas pela motricidade fina comprometida."),
  ]),
  assimilation("singular", 9, "9", "da Montanha", "O sangue engrossa e a circulação ajusta-se; suporta ar rarefeito e frio intenso, mantendo energia e estabilidade em altitude.", 161, [
    ability("Urubu-Rei", "Não sofre penalidades por altitudes elevadas ou ar rarefeito e mantém esforço físico moderado por mais tempo."),
    ability("Calango-bandeira", "Prende a respiração por até dez minutos, mas em clima quente e seco penaliza Influência ou Expressão."),
    ability("Tucanuçu", "Em ambientes abafados ou de alta umidade, reduz Sagacidade até deixar o local."),
    ability("Sapo-cururu", "Após ser derrubado ou sofrer queda, testa Potência ou sofre dano adicional por instabilidade articular."),
  ]),
  assimilation("singular", 10, "10", "do Pântano", "Pele e pulmões toleram gases e microrganismos de água estagnada; o terreno alagado torna-se proteção natural.", 161, [
    ability("Guaiamu", "Ignora penalidades de movimento em terrenos encharcados ou instáveis e atravessa água ou lama sem teste."),
    ability("Garça-azul", "Recebe dados adicionais em Furtividade ao caminhar sobre lama ou folhas alagadas."),
  ]),
  assimilation("singular", 11, "J", "da Caatinga", "O organismo reduz funções em longos períodos secos, desperta com chuvas ocasionais e protege-se com pele espessa e pontiaguda.", 161, [
    ability("Rola-bosta", "Reduz em um todo dano cortante ou perfurante sofrido por fontes naturais; não se aplica a armas de fogo ou energia."),
    ability("Asa-branca", "Protege contra insolação e exposição solar extrema por duas cenas, mas reduz Influência por causa da aparência enrijecida."),
  ]),
  assimilation("singular", 12, "Q", "Subterrânea", "A visão perde relevância; pele e ouvido detectam vibrações e correntes de ar em túneis, orientando-se no escuro.", 162, [
    ability("Tatu-canastra", "Percebe presenças em raio de dez metros ao tocar o chão com mãos ou pés descalços, identificando intensidade e distância."),
    ability("Coruja-buraqueira", "Recebe dados adicionais para identificar sons abafados ou ecos subterrâneos, mas ruídos altos repentinos penalizam Reação."),
    ability("Morcego-de-cauda-livre", "Sons sobrepostos sobrecarregam e reduzem Sagacidade em locais com máquinas, motores ou grandes multidões."),
  ]),
  assimilation("singular", 13, "K", "da Tundra", "O metabolismo regula o calor em ambientes congelados; o sangue não congela e o corpo suporta longos períodos de torpor.", 162, [
    ability("Líquen-de-mapa", "Não sofre penalidades por frio intenso ou neve, mesmo abaixo de -20 graus Celsius."),
    ability("Marmota-alpina", "Pode entrar voluntariamente em torpor por até 12 horas; ao sair, reduz Potência até o próximo descanso."),
    ability("Husky siberiano", "Os pelos protegem contra o frio, mas em ambientes quentes sofre penalidade adicional em Atletismo."),
  ]),
];

export const assimilationCatalogById = Object.fromEntries(
  officialAssimilations.map((assimilation) => [assimilation.id, assimilation]),
);

export function validateAssimilationCatalog(catalog = officialAssimilations) {
  const issues = [];
  const ids = new Set();
  const abilityIds = new Set();
  catalog.forEach((assimilation, index) => {
    if (!assimilation?.id) issues.push(`Assimilação ${index + 1}: id ausente`);
    if (ids.has(assimilation?.id)) issues.push(`Assimilação ${assimilation.id}: id duplicado`);
    ids.add(assimilation?.id);
    if (!assimilation?.name) issues.push(`Assimilação ${assimilation?.id || index + 1}: nome vazio`);
    if (!assimilationFamilies.includes(assimilation?.family)) issues.push(`Assimilação ${assimilation?.id || index + 1}: família inválida`);
    if (!Number.isInteger(assimilation?.level) || assimilation.level < 1 || assimilation.level > 13) issues.push(`Assimilação ${assimilation?.id || index + 1}: nível inválido`);
    if (typeof assimilation?.description !== "string" || !assimilation.description.trim()) issues.push(`Assimilação ${assimilation?.id || index + 1}: descrição vazia`);
    if (!Array.isArray(assimilation?.abilities) || assimilation.abilities.length === 0) issues.push(`Assimilação ${assimilation?.id || index + 1}: abilities inválido`);
    (assimilation?.abilities || []).forEach((entry, abilityIndex) => {
      if (!entry?.id) issues.push(`${assimilation.id}: habilidade ${abilityIndex + 1} sem id`);
      if (abilityIds.has(entry?.id)) issues.push(`Habilidade ${entry.id}: id duplicado`);
      abilityIds.add(entry?.id);
      if (!entry?.name) issues.push(`${assimilation.id}: habilidade ${entry?.id || abilityIndex + 1} sem nome`);
      if (typeof entry?.description !== "string" || !entry.description.trim()) issues.push(`${assimilation.id}: habilidade ${entry?.id || abilityIndex + 1} sem descrição`);
    });
  });
  return { valid: issues.length === 0, issues, assimilationCount: catalog.length, abilityCount: [...abilityIds].length };
}

export function getAssimilationSearchText(assimilation) {
  return [
    assimilation?.name,
    assimilation?.description,
    assimilationFamilyLabels[assimilation?.family],
    ...(assimilation?.abilities || []).flatMap((entry) => [entry.name, entry.description, entry.costText]),
  ].filter(Boolean).join(" ");
}
