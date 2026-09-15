import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Next.js 15 App Router Edge/Node runtime configuration
export const maxDuration = 60; // Set max duration for API route to 60s

export async function POST(req: NextRequest) {
  try {
    const { base64Pdf, jobData } = await req.json();

    if (!base64Pdf || !jobData) {
      return NextResponse.json(
        { error: 'Missing resume or job posting data' },
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
    
    // Construct the prompt
    const prompt = `
      당신은 전문적인 HR 담당자이자 시니어 개발자 멘토입니다.
      주어진 채용 공고(Job Description)와 지원자의 이력서(PDF)를 분석하여 직무 적합도를 평가해주세요.

      [채용 공고 정보]
      - 설명: ${jobData.description}
      - 자격 요건: ${jobData.requirements || '없음'}
      - 우대 사항: ${jobData.preferred_qualifications || '없음'}
      - 필요 기술 스택: ${jobData.required_tech_stack_ids?.join(', ') || '제한 없음'}

      위 공고와 함께 전달된 이력서를 바탕으로 다음 내용을 포함하여 답변해주세요:
      1. 직무 매칭률 (0~100%)
      2. 이력서 상의 강점 (채용 공고와 잘 맞는 부분)
      3. 개선 포인트 (채용 공고 대비 부족하거나 보완하면 좋을 부분)
      4. 면접 예상 질문 3가지

      답변은 반드시 아래 JSON 형식으로만 반환해주세요. (마크다운 백틱 없이 순수 JSON 문자열)
      {
        "matchPercentage": 85,
        "strengths": ["강점1", "강점2"],
        "improvements": ["개선점1", "개선점2"],
        "interviewQuestions": ["질문1", "질문2", "질문3"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Pdf,
            mimeType: 'application/pdf',
          },
        },
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new Error('Gemini API returned empty response');
    }

    // Parse the JSON string from Gemini
    const resultJson = JSON.parse(response.text);

    return NextResponse.json(resultJson);

  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
