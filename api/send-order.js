export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, total, user } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  if (!total) {
    return res.status(400).json({ error: 'Total is required' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const ADMIN_ID = process.env.ADMIN_ID;

  if (!BOT_TOKEN || !ADMIN_ID) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Format items list
  const itemsList = items.map(item => {
    const brand = item.brand || '—';
    const model = item.model || '—';
    const size = item.size || '—';
    const cond = item.cond || item.condition || '—';
    const price = item.price || '—';
    return `${brand} ${model} (Размер: ${size}, Состояние: ${cond}) — ${price} ₴`;
  }).join('\n');

  // Format buyer info
  const firstName = user?.first_name || 'Покупатель';
  const userId = user?.id || '—';
  const username = user?.username ? `@${user.username}` : '';
  const buyerLine = `👤 Покупатель: ${firstName} (ID: ${userId}${username ? `, ${username}` : ''})`;

  // Build admin message
  const adminMessage = (
    '🛒 НОВЫЙ ЗАКАЗ (через API)!\n' +
    `${buyerLine}\n` +
    '📦 Товары:\n' +
    `${itemsList}\n` +
    `💵 Итого: ${total} ₴`
  );

  try {
    // Send message to admin
    const adminResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: ADMIN_ID,
          text: adminMessage,
        }),
      }
    );

    if (!adminResponse.ok) {
      const errorData = await adminResponse.json();
      console.error('Failed to send message to admin:', errorData);
      return res.status(500).json({ error: 'Failed to notify admin' });
    }

    // Send confirmation to buyer if user.id is available
    if (user?.id) {
      const buyerMessage = (
        '✅ Заказ успешно оформлен!\n' +
        'Мы уже получили вашу заявку и свяжемся с вами в ближайшее время ' +
        'для уточнения деталей. Спасибо, что выбрали bariga057!'
      );

      const buyerResponse = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: user.id,
            text: buyerMessage,
          }),
        }
      );

      if (!buyerResponse.ok) {
        console.error('Failed to send confirmation to buyer:', await buyerResponse.json());
        // Don't fail the request if buyer notification fails
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
