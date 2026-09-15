import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { messages, base64Pdf, jobData } = await req.json();

    if (!messages || !base64Pdf || !jobData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 시스템 프롬프트 (가장 첫 번째 메시지로 전달)
    const systemPrompt = `
      당신은 지금부터 전문적이고 예리한 시니어 기술 면접관입니다.
      당신이 소속된 회사의 정보 및 채용 공고 내용은 다음과 같습니다:
      - 설명: ${jobData.description}
      - 자격 요건: ${jobData.requirements || '없음'}
      - 우대 사항: ${jobData.preferred_qualifications || '없음'}
      - 필요 기술 스택: ${jobData.required_tech_stack_ids?.join(', ') || '제한 없음'}

      지원자의 이력서는 첨부된 PDF 파일과 같습니다.

      면접 규칙:
      1. 한 번에 단 하나의 질문만 하세요.
      2. 지원자의 이전 답변을 평가하고 꼬리 질문(Deep Dive)을 이어가세요.
      3. 질문은 반드시 지원자의 이력서 내용이나 위 채용 공고 내용과 관련이 있어야 합니다.
      4. 면접관으로서 전문가다운 어조를 유지하되, 너무 길게 말하지 마세요. (최대 3~4문장)
      5. 첫 번째 메시지는 당신이 지원자에게 먼저 "안녕하세요, 면접을 시작하겠습니다..." 라며 첫 질문을 건네는 방식으로 시작됩니다. (사용자의 빈 메시지에 대한 첫 응답)
    `;

    // Gemini API 포맷으로 메시지 변환
    const contents: any[] = [];
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (i === 0 && msg.role === 'user') {
        // 첫 번째 유저 메시지에 시스템 프롬프트와 이력서(PDF)를 함께 전달
        contents.push({
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: msg.content },
            {
              inlineData: {
                data: base64Pdf,
                mimeType: 'application/pdf'
              }
            }
          ]
        });
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    if (!response.text) {
      throw new Error('Gemini API returned empty response');
    }

    return NextResponse.json({
      role: 'assistant',
      content: response.text
    });

  } catch (error: any) {
    console.error('Interview API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
