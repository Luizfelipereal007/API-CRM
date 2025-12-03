import faqData from '../data/faqData.js';

const CONFIG = {
  weights: {
    questionSimilarity: 0.3,
    wordOverlap: 0.25,
    keywords: 0.35,
    similarQuestions: 0.1
  },
  thresholds: {
    minConfidence: 0.15,
    similarityMatch: 0.8
  },
  minWordLength: 3
};

const STOPWORDS = new Set([
  'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'em', 'na', 'no',
  'para', 'por', 'com', 'sem', 'sob', 'e', 'ou', 'mas', 'que', 'qual',
  'como', 'onde', 'quando', 'porque', 'se', 'meu', 'minha', 'seu', 'sua',
  'todos', 'todas', 'este', 'esta', 'esses', 'essas', 'esse', 'essa'
]);

export default class FAQController {
  static cache = new Map();
  static preprocessedFAQs = null;

  static initializeCache() {
    if (this.preprocessedFAQs) return;

    this.preprocessedFAQs = faqData.map((faq, index) => ({
      ...faq,
      index,
      normalizedQuestion: this.normalizeText(faq.pergunta),
      normalizedKeywords: faq.palavrasChave.map(k => this.normalizeText(k)),
      normalizedSimilarQuestions: (faq.perguntasSimilares || []).map(q => 
        this.normalizeText(q)
      ),
      questionTokens: this.tokenize(faq.pergunta),
      keywordTokens: faq.palavrasChave.flatMap(k => this.tokenize(k))
    }));
  }

  static normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ') 
      .replace(/\s+/g, ' ') 
      .trim();
  }

  static tokenize(text, removeStopwords = true) {
    const normalized = this.normalizeText(text);
    const tokens = normalized.split(/\s+/).filter(word => 
      word.length >= CONFIG.minWordLength
    );
    
    if (removeStopwords) {
      return tokens.filter(word => !STOPWORDS.has(word));
    }
    
    return tokens;
  }

  static jaccardSimilarity(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  static wordOverlap(tokens1, tokens2) {
    if (tokens1.length === 0 || tokens2.length === 0) return 0;
    return this.jaccardSimilarity(tokens1, tokens2);
  }

  static keywordScore(questionTokens, faq) {
    if (questionTokens.length === 0) return 0;

    let matchCount = 0;
    const questionSet = new Set(questionTokens);

    faq.keywordTokens.forEach(keyword => {
      if (questionSet.has(keyword)) {
        matchCount += 2;
      }
    });

    const questionText = questionTokens.join(' ');
    faq.normalizedKeywords.forEach(keyword => {
      if (questionText.includes(keyword)) {
        matchCount += 1;
      }
    });

    return faq.normalizedKeywords.length > 0 
      ? matchCount / faq.normalizedKeywords.length 
      : 0;
  }

  static similarQuestionsScore(questionTokens, faq) {
    if (faq.normalizedSimilarQuestions.length === 0) return 0;

    const scores = faq.normalizedSimilarQuestions.map(similar => {
      const similarTokens = this.tokenize(similar);
      return this.jaccardSimilarity(questionTokens, similarTokens);
    });

    return Math.max(...scores, 0);
  }

  static encontrarMelhorResposta(pergunta) {
    if (!pergunta?.trim()) {
      return {
        success: false,
        message: "Pergunta não pode estar vazia"
      };
    }

    FAQController.initializeCache();

    const questionTokens = FAQController.tokenize(pergunta);
    const normalizedQuestion = FAQController.normalizeText(pergunta);

    if (questionTokens.length === 0) {
      return {
        success: false,
        message: "Pergunta não contém palavras válidas"
      };
    }

    const scores = FAQController.preprocessedFAQs.map(faq => {
      const scores = {
        questionSimilarity: FAQController.jaccardSimilarity(questionTokens, faq.questionTokens),
        wordOverlap: FAQController.wordOverlap(questionTokens, faq.questionTokens),
        keywords: FAQController.keywordScore(questionTokens, faq),
        similarQuestions: FAQController.similarQuestionsScore(questionTokens, faq)
      };

      const totalScore = 
        scores.questionSimilarity * CONFIG.weights.questionSimilarity +
        scores.wordOverlap * CONFIG.weights.wordOverlap +
        scores.keywords * CONFIG.weights.keywords +
        scores.similarQuestions * CONFIG.weights.similarQuestions;

      return {
        faq,
        scores,
        totalScore
      };
    });

    scores.sort((a, b) => b.totalScore - a.totalScore);

    const best = scores[0];
    const threshold = CONFIG.thresholds.minConfidence;

    if (best.totalScore < threshold) {
      return {
        success: false,
        message: "Não foi possível encontrar uma resposta relacionada à sua pergunta",
        score: best.totalScore,
        threshold,
        detalhes: scores.slice(0, 3).map(s => ({
          assunto: s.faq.assunto,
          perguntaOriginal: s.faq.pergunta,
          scoreTotal: s.totalScore
        }))
      };
    }

    return {
      success: true,
      data: {
        assunto: best.faq.assunto,
        resposta: best.faq.resposta,
        perguntaOriginal: best.faq.pergunta,
        score: best.totalScore
      },
      detalhes: scores.slice(0, 3).map(s => ({
        assunto: s.faq.assunto,
        perguntaOriginal: s.faq.pergunta,
        scoreTotal: s.totalScore,
        scores: s.scores
      }))
    };
  }

  static async buscarFAQ(req, res) {
    try {
      const { pergunta } = req.body;

      if (!pergunta) {
        return res.status(400).json({
          status: false,
          message: "Campo 'pergunta' é obrigatório"
        });
      }

      const resultado = FAQController.encontrarMelhorResposta(pergunta);

      if (!resultado.success) {
        return res.status(404).json({
          status: false,
          message: resultado.message,
          score: resultado.score?.toFixed(3),
          threshold: resultado.threshold,
          sugestoes: resultado.detalhes?.map(d => ({
            assunto: d.assunto,
            pergunta: d.perguntaOriginal,
            score: d.scoreTotal.toFixed(3)
          }))
        });
      }

      res.status(200).json({
        status: true,
        message: "Resposta encontrada com sucesso",
        score: resultado.data.score.toFixed(3),
        data: {
          assunto: resultado.data.assunto,
          resposta: resultado.data.resposta
        },
        debug: {
          perguntaOriginal: resultado.data.perguntaOriginal,
          topMatches: resultado.detalhes?.map(d => ({
            assunto: d.assunto,
            pergunta: d.perguntaOriginal,
            score: d.scoreTotal.toFixed(3),
            breakdown: d.scores
          }))
        }
      });

    } catch (error) {
      console.error('Erro ao buscar FAQ:', error);
      res.status(500).json({
        status: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  static async listarAssuntos(req, res) {
    try {
      FAQController.initializeCache();
      
      const assuntosMap = new Map();
      
      FAQController.preprocessedFAQs.forEach(faq => {
        if (!assuntosMap.has(faq.assunto)) {
          assuntosMap.set(faq.assunto, {
            assunto: faq.assunto,
            perguntas: [],
            palavrasChave: new Set()
          });
        }
        
        const assuntoData = assuntosMap.get(faq.assunto);
        assuntoData.perguntas.push(faq.pergunta);
        faq.palavrasChave.forEach(palavra => 
          assuntoData.palavrasChave.add(palavra)
        );
      });

      const assuntos = Array.from(assuntosMap.values()).map(a => ({
        assunto: a.assunto,
        totalPerguntas: a.perguntas.length,
        palavrasChave: Array.from(a.palavrasChave)
      }));
      
      res.status(200).json({
        status: true,
        message: `Encontrados ${assuntos.length} assuntos`,
        data: assuntos
      });
    } catch (error) {
      console.error('Erro ao listar assuntos:', error);
      res.status(500).json({
        status: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  static async buscarPorAssunto(req, res) {
    try {
      const { assunto } = req.params;
      FAQController.initializeCache();
      
      const assuntoNormalizado = FAQController.normalizeText(assunto);
      
      const faqsAssunto = FAQController.preprocessedFAQs.filter(faq => 
        FAQController.normalizeText(faq.assunto).includes(assuntoNormalizado)
      );

      if (faqsAssunto.length === 0) {
        return res.status(404).json({
          status: false,
          message: `Nenhuma pergunta encontrada para o assunto: ${assunto}`
        });
      }

      res.status(200).json({
        status: true,
        message: `Encontradas ${faqsAssunto.length} perguntas para o assunto: ${assunto}`,
        data: faqsAssunto.map(faq => ({
          assunto: faq.assunto,
          pergunta: faq.pergunta,
          resposta: faq.resposta,
          palavrasChave: faq.palavrasChave
        }))
      });

    } catch (error) {
      console.error('Erro ao buscar por assunto:', error);
      res.status(500).json({
        status: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}