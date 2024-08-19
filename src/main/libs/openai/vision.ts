import { openAi } from '@src/main/libs/openai';
import { Result } from '@src/types/result';

export const generateCaption = async (imgSrc: string) => {
  const captionResult: Result<string, Error> = await openAi.chat.completions
    .create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            //英語で画像を説明してねという指示
            {
              type: 'text',
              text: 'Create a caption for the image. However, please use English.',
            },

            /**
            //日本語で画像を説明してねという指示
            {
              type: 'text',
              text: 'Create a caption for the image. However, please use Japanese.',
            },
            */

            {
              type: 'image_url',
              image_url: {
                url: imgSrc,
              },
            },
          ],
        },
      ],
    })
    .then((completion) => {
      const caption = completion.choices[0]?.message.content;
      if (!caption) {
        return {
          ok: false,
          error: new Error('caption is null'),
        } as const;
      }

      const ngWordsRegexps = [/[写映].*(ない|せん)/, /申し訳/, /できません/];

      const isNgWord = ngWordsRegexps.some((regexp) => regexp.test(caption));
      if (isNgWord) {
        return {
          ok: false,
          error: new Error('caption includes ng word'),
        } as const;
      }

      return {
        ok: true,
        value: caption,
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

  return captionResult;
};
