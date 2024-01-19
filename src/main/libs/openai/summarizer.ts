import { openAi } from '@src/main/libs/openai';
import { Result } from '@src/types/result';

export const summarize = async (text: string) => {
  const summaryResult: Result<string, Error> = await openAi.chat.completions
    .create({
      model: 'gpt-3.5-turbo-16k-0613',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Summarize the following text into 3 sentences in Japanese. Try to extract proper nouns.\n\n${text}`,
            },
          ],
        },
      ],
    })
    .then((completion) => {
      const summary = completion.choices[0]?.message.content;
      if (!summary) {
        return {
          ok: false,
          error: new Error('summary is null'),
        } as const;
      }

      return {
        ok: true,
        value: summary,
      } as const;
    })
    .catch((err) => {
      if (err instanceof Error) {
        return {
          ok: false,
          error: err,
        } as const;
      }
      return {
        ok: false,
        error: new Error('unknown error'),
      } as const;
    });

  return summaryResult;
};
