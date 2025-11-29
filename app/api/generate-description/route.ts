import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { nome, categoria } = await request.json();

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome do produto é obrigatório' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Se não houver API key, retorna uma descrição padrão
      const descricaoPadrao = `${nome} é um produto de alta qualidade da categoria ${categoria || 'diversos'}. Ideal para quem busca excelência e durabilidade. Produto com ótimo custo-benefício e acabamento premium.`;

      return NextResponse.json({
        description: descricaoPadrao,
        isDefault: true
      });
    }

    // Chamada para API da OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em e-commerce que cria descrições persuasivas e atrativas para produtos.',
          },
          {
            role: 'user',
            content: `Crie uma descrição curta e atrativa (2-3 frases) para um produto chamado "${nome}" da categoria "${categoria || 'diversos'}". A descrição deve ser em português, persuasiva e destacar benefícios.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar descrição com IA');
    }

    const data = await response.json();
    const description = data.choices[0]?.message?.content || '';

    return NextResponse.json({ description, isDefault: false });
  } catch (error) {
    console.error('Erro ao gerar descrição:', error);

    // Retorna descrição padrão em caso de erro
    const { nome, categoria } = await request.json();
    const descricaoPadrao = `${nome} é um produto de alta qualidade da categoria ${categoria || 'diversos'}. Ideal para quem busca excelência e durabilidade.`;

    return NextResponse.json({
      description: descricaoPadrao,
      isDefault: true
    });
  }
}
