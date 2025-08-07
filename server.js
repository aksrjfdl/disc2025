require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const currentYear = new Date().getFullYear();
const app = express();
app.use(cors());
app.use(express.json());

// POST 요청: 운세 생성
app.post("/get-fortune", async (req, res) => {
    const { gender, birthdate, birthtime, fortuneType } = req.body;
    const currentYear = new Date().getFullYear();
    

    // 프롬프트 구성
    const prompt = `당신은 사주 운세 전문가이며, 운세를 한국어로 친절하고 자연스럽게 작성해야 합니다.

다음 정보를 참고하여 ${fortuneType === 'day' ? '오늘의 운세' : fortuneType === 'year' ? '올해운세' : '평생 운세' }를 작성해 주세요:


- 성별: ${gender}
- 생년월일: ${birthdate}
- 태어난 시간: ${birthtime}
- 운세 종류: ${fortuneType}

운세는 다음 5가지 항목으로 구성해 주세요. 반드시 한국어로만, 마크다운(**, ## 등) 없이, 순수한 텍스트 형식으로 작성하세요:


1. 종합운
2. 애정운
3. 금전운
4. 건강운
5. 직업운

각 항목별로 2~3문장씩, 긍정적이면서도 현실적인 조언을 포함하여 작성해 주세요.
`;


    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-70b-8192", 
                messages: [
                    { role: "system", content: "당신은 사주 운세 전문가입니다." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.9,
                max_tokens: 800
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const result = response.data.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error("Groq API 오류:", error.message);
        res.status(500).json({ error: "운세 생성 실패 (Groq API)" });
    }
});

app.listen(3000, () => {
    console.log("서버 실행 중: http://localhost:3000");
});
