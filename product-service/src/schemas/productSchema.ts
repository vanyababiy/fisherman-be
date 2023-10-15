export const productSchema = {
  type: "object",
  properties: {
    count: { type: 'string' },
    description: { type: 'string' },
    id: { type: 'string' },
    price: { type: 'number' },
    title: { type: 'string' },
  },
  required: ['count', 'description', 'id', 'price', 'title']
};
