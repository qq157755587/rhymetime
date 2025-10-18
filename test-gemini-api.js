// Test script to verify Gemini API configuration
const GEMINI_API_KEY = '';

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...');
  console.log('🔑 API Key:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : 'Not found');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Write a simple 2-line nursery rhyme about a cat.'
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 100,
        }
      }),
    });

    const data = await response.json();
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response OK:', response.ok);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('❌ API Error:', data.error?.message || 'Unknown error');
      return false;
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ Generated Text:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return false;
  }
}

testGeminiAPI().then(success => {
  console.log(success ? '✅ Test passed!' : '❌ Test failed!');
});