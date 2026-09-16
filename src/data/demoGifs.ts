export type DemoGif = {
  id: string;
  label: string;
  url: string;
  tags: string[];
};

/** Curated GIF URLs for demo chat (Giphy CDN, static links) */
export const DEMO_GIFS: DemoGif[] = [
  {
    id: 'wave',
    label: 'Wave',
    tags: ['hello', 'hi', 'greet', 'wave'],
    url: 'https://media.giphy.com/media/3o7aD2saQpmrRkDIIg/giphy.gif',
  },
  {
    id: 'heart',
    label: 'Heart',
    tags: ['love', 'like', 'heart', 'cute'],
    url: 'https://media.giphy.com/media/26BRuo6sGiljlQw4E/giphy.gif',
  },
  {
    id: 'lol',
    label: 'LOL',
    tags: ['laugh', 'funny', 'lol', 'haha'],
    url: 'https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif',
  },
  {
    id: 'fire',
    label: 'Fire',
    tags: ['hot', 'fire', 'lit', 'awesome'],
    url: 'https://media.giphy.com/media/3o6Zt4HU9qGmm9kjzy/giphy.gif',
  },
  {
    id: 'cheers',
    label: 'Cheers',
    tags: ['drink', 'celebrate', 'cheers', 'toast'],
    url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif',
  },
  {
    id: 'thinking',
    label: 'Hmm',
    tags: ['think', 'hmm', 'curious', 'wonder'],
    url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVy/giphy.gif',
  },
  {
    id: 'dance',
    label: 'Dance',
    tags: ['dance', 'party', 'music', 'fun'],
    url: 'https://media.giphy.com/media/11sBLlHzlKRlI/giphy.gif',
  },
  {
    id: 'shy',
    label: 'Shy',
    tags: ['shy', 'blush', 'cute', 'awkward'],
    url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
  },
  {
    id: 'wow',
    label: 'Wow',
    tags: ['wow', 'amazed', 'surprised', 'omg'],
    url: 'https://media.giphy.com/media/maqaW1dfg9dZi/giphy.gif',
  },
  {
    id: 'clap',
    label: 'Clap',
    tags: ['clap', 'applause', 'bravo', 'yes'],
    url: 'https://media.giphy.com/media/7rjPZNxWvKgHzQK3kU/giphy.gif',
  },
  {
    id: 'coffee',
    label: 'Coffee',
    tags: ['coffee', 'cafe', 'morning', 'date'],
    url: 'https://media.giphy.com/media/3o6Zt481isNVvbQI40/giphy.gif',
  },
  {
    id: 'date',
    label: 'Date night',
    tags: ['date', 'romance', 'dinner', 'night'],
    url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
  },
  {
    id: 'kiss',
    label: 'Kiss',
    tags: ['kiss', 'love', 'romance', 'xoxo'],
    url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  },
  {
    id: 'excited',
    label: 'Excited',
    tags: ['excited', 'yay', 'happy', 'hype'],
    url: 'https://media.giphy.com/media/5VKbvrjxpVJ3a/giphy.gif',
  },
  {
    id: 'sleepy',
    label: 'Sleepy',
    tags: ['tired', 'sleep', 'night', 'yawn'],
    url: 'https://media.giphy.com/media/3o6Zt6ML6B3yA9debe/giphy.gif',
  },
  {
    id: 'thanks',
    label: 'Thanks',
    tags: ['thanks', 'thank you', 'grateful', 'appreciate'],
    url: 'https://media.giphy.com/media/osjgQPWRx3cac/giphy.gif',
  },
];
