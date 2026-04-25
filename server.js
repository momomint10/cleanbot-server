const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
 
const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
 
// Supabase Ã¬ÂÂ°ÃªÂ²Â°
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
 
// Ã¢ÂÂÃ¢ÂÂ Ã¬ÂÂÃ«Â²Â Ã¬ÂÂÃ­ÂÂ Ã­ÂÂÃ¬ÂÂ¸ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ã¬ÂÂ¹Ã¬ÂÂ¹ Ã¬ÂÂÃ«Â²Â Ã¬Â ÂÃ¬ÂÂ Ã¬ÂÂÃ«ÂÂ Ã¬Â¤Â Ã°ÂÂ§Â¹',
    version: '1.0.0'
  });
});
 
// Ã¢ÂÂÃ¢ÂÂ ÃªÂµÂ¬Ã«ÂÂÃ¬ÂÂ Ã¬ÂÂ¬Ã¬Â Â Ã¬ÂÂ Ã¬Â²Â­ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// Ã«ÂÂÃ«ÂÂ©Ã­ÂÂÃ¬ÂÂ´Ã¬Â§ÂÃ¬ÂÂÃ¬ÂÂ Ã¬ÂÂ¬Ã¬Â Â Ã¬ÂÂ Ã¬Â²Â­ Ã¬ÂÂ Ã­ÂÂ¸Ã¬Â¶Â
app.post('/api/subscribe', async (req, res) => {
  const { company_name, phone, email, plan } = req.body;
 
  if (!company_name || !phone) {
    return res.status(400).json({ error: 'Ã¬ÂÂÃ¬Â²Â´Ã«ÂªÂÃªÂ³Â¼ Ã¬ÂÂ°Ã«ÂÂ½Ã¬Â²ÂÃ«ÂÂ Ã­ÂÂÃ¬ÂÂÃ¬ÂÂÃ«ÂÂÃ«ÂÂ¤' });
  }
 
  try {
    // Ã¬Â¤ÂÃ«Â³Âµ Ã¬Â²Â´Ã­ÂÂ¬
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id')
      .eq('phone', phone)
      .single();
 
    if (existing) {
      return res.json({ success: true, message: 'Ã¬ÂÂ´Ã«Â¯Â¸ Ã¬ÂÂ Ã¬Â²Â­Ã­ÂÂÃ¬ÂÂ¨Ã¬ÂÂµÃ«ÂÂÃ«ÂÂ¤!', duplicate: true });
    }
 
    // ÃªÂµÂ¬Ã«ÂÂÃ¬ÂÂ Ã¬Â ÂÃ¬ÂÂ¥
    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .insert([{
        company_name,
        phone,
        email: email || null,
        plan: plan || 'standard',
        status: 'pending',
      }])
      .select()
      .single();
 
    if (error) throw error;
 
    // ÃªÂ¸Â°Ã«Â³Â¸ Ã¬ÂÂÃ¬Â²Â´ Ã¬ÂÂ¤Ã¬Â Â Ã¬ÂÂÃ«ÂÂ Ã¬ÂÂÃ¬ÂÂ±
    await supabase
      .from('business_settings')
      .insert([{
        subscriber_id: subscriber.id,
        company_name,
        phone,
        greeting: `Ã¬ÂÂÃ«ÂÂÃ­ÂÂÃ¬ÂÂ¸Ã¬ÂÂ! Ã°ÂÂÂ ${company_name} Ã¬ÂÂÃ¬Â£Â¼Ã¬Â²Â­Ã¬ÂÂ Ã¬Â ÂÃ«Â¬Â¸Ã­ÂÂÃ¬ÂÂÃ«ÂÂÃ«ÂÂ¤.`,
      }]);
 
    res.json({
      success: true,
      message: 'Ã¬ÂÂ Ã¬Â²Â­Ã¬ÂÂ´ Ã¬ÂÂÃ«Â£ÂÃ«ÂÂÃ¬ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤! Ã¬Â¶ÂÃ¬ÂÂ Ã¬ÂÂ Ã¬ÂÂ°Ã«ÂÂ½Ã«ÂÂÃ«Â¦Â´ÃªÂ²ÂÃ¬ÂÂ Ã°ÂÂÂ',
      id: subscriber.id
    });
 
  } catch (err) {
    console.error('ÃªÂµÂ¬Ã«ÂÂ Ã¬ÂÂ Ã¬Â²Â­ Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥ÂÃªÂ°Â Ã«Â°ÂÃ¬ÂÂÃ­ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤' });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ ÃªÂµÂ¬Ã«ÂÂÃ¬ÂÂ Ã«ÂªÂ©Ã«Â¡Â Ã¬Â¡Â°Ã­ÂÂ (ÃªÂ´ÂÃ«Â¦Â¬Ã¬ÂÂÃ¬ÂÂ©) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.get('/api/subscribers', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Ã¬ÂÂ¸Ã¬Â¦Â Ã¬ÂÂ¤Ã­ÂÂ¨' });
  }
 
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });
 
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
 
  } catch (err) {
    console.error('ÃªÂµÂ¬Ã«ÂÂÃ¬ÂÂ Ã¬Â¡Â°Ã­ÂÂ Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â' });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ ÃªÂµÂ¬Ã«ÂÂÃ¬ÂÂ Ã¬ÂÂÃ­ÂÂ Ã«Â³ÂÃªÂ²Â½ (ÃªÂ´ÂÃ«Â¦Â¬Ã¬ÂÂÃ¬ÂÂ©) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.put('/api/subscribers/:id/status', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Ã¬ÂÂ¸Ã¬Â¦Â Ã¬ÂÂ¤Ã­ÂÂ¨' });
  }
 
  const { id } = req.params;
  const { status } = req.body;
 
  const validStatuses = ['pending', 'active', 'paused', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Ã¬ÂÂ Ã­ÂÂ¨Ã­ÂÂÃ¬Â§Â Ã¬ÂÂÃ¬ÂÂ Ã¬ÂÂÃ­ÂÂÃªÂ°ÂÃ¬ÂÂÃ«ÂÂÃ«ÂÂ¤' });
  }
 
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
 
    if (error) throw error;
    res.json({ success: true, data });
 
  } catch (err) {
    console.error('Ã¬ÂÂÃ­ÂÂ Ã«Â³ÂÃªÂ²Â½ Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â' });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ Ã¬ÂÂÃ¬Â²Â´ Ã¬ÂÂ¤Ã¬Â Â Ã¬Â¡Â°Ã­ÂÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.get('/api/settings/:id', async (req, res) => {
  const { id } = req.params;
 
  try {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('subscriber_id', id)
      .single();
 
    if (error) throw error;
    res.json({ success: true, data });
 
  } catch (err) {
    console.error('Ã¬ÂÂ¤Ã¬Â Â Ã¬Â¡Â°Ã­ÂÂ Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â' });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ Ã¬ÂÂÃ¬Â²Â´ Ã¬ÂÂ¤Ã¬Â Â Ã¬ÂÂÃ«ÂÂ°Ã¬ÂÂ´Ã­ÂÂ¸ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.put('/api/settings/:id', async (req, res) => {
  const { id } = req.params;
  const settings = req.body;
 
  try {
    const { data, error } = await supabase
      .from('business_settings')
      .update(settings)
      .eq('subscriber_id', id)
      .select()
      .single();
 
    if (error) throw error;
    res.json({ success: true, data });
 
  } catch (err) {
    console.error('Ã¬ÂÂ¤Ã¬Â Â Ã¬ÂÂÃ«ÂÂ°Ã¬ÂÂ´Ã­ÂÂ¸ Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â' });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ Ã¬ÂÂ¸Ã«Â Â¥ Ã­ÂÂ Ã«ÂªÂ©Ã«Â¡Â Ã¬Â¡Â°Ã­ÂÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.get('/api/workforce', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id, company_name, phone, plan, status, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
 
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
 
  } catch (err) {
    console.error('Ã¬ÂÂ¸Ã«Â Â¥ Ã­ÂÂ Ã¬Â¡Â°Ã­ÂÂ Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â' });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ Ã­ÂÂµÃªÂ³Â (ÃªÂ´ÂÃ«Â¦Â¬Ã¬ÂÂÃ¬ÂÂ©) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.get('/api/stats', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Ã¬ÂÂ¸Ã¬Â¦Â Ã¬ÂÂ¤Ã­ÂÂ¨' });
  }
 
  try {
    const { data: all } = await supabase.from('subscribers').select('status, plan');
 
    const stats = {
      total: all.length,
      pending: all.filter(s => s.status === 'pending').length,
      active: all.filter(s => s.status === 'active').length,
      by_plan: {
        basic: all.filter(s => s.plan === 'basic').length,
        standard: all.filter(s => s.plan === 'standard').length,
        premium: all.filter(s => s.plan === 'premium').length,
      }
    };
 
    res.json({ success: true, stats });
 
  } catch (err) {
    console.error('Ã­ÂÂµÃªÂ³Â Ã¬Â¡Â°Ã­ÂÂ Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â' });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ SMS Ã«Â°ÂÃ¬ÂÂ¡ (CoolSMS) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.post('/api/sms/send', async (req, res) => {
  const { to, msg, subject } = req.body;
 
  // Ã­ÂÂÃªÂ²Â½Ã«Â³ÂÃ¬ÂÂÃ¬ÂÂÃ¬ÂÂ API Ã­ÂÂ¤ Ã«Â¡ÂÃ«ÂÂ (Ã¬ÂÂ¬Ã¬ÂÂ©Ã¬ÂÂÃ¬ÂÂÃªÂ²Â Ã«ÂÂ¸Ã¬Â¶Â Ã¬ÂÂ Ã«ÂÂ¨)
  const apiKey = process.env.COOLSMS_API_KEY;
  const apiSecret = process.env.COOLSMS_API_SECRET;
  const from = process.env.COOLSMS_FROM;
 
  if (!apiKey || !apiSecret || !from) {
    return res.status(500).json({ error: 'SMS APIÃªÂ°Â Ã¬ÂÂ¤Ã¬Â ÂÃ«ÂÂÃ¬Â§Â Ã¬ÂÂÃ¬ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤.' });
  }
  if (!to || !msg) {
    return res.status(400).json({ error: 'Ã¬ÂÂÃ¬ÂÂ Ã«Â²ÂÃ­ÂÂ¸Ã¬ÂÂ Ã«Â©ÂÃ¬ÂÂÃ¬Â§ÂÃ«ÂÂ Ã­ÂÂÃ¬ÂÂÃ¬ÂÂÃ«ÂÂÃ«ÂÂ¤' });
  }
 
  try {
    const crypto = require('crypto');
    const date = new Date().toISOString();
    const salt = Math.random().toString(36).substring(2, 12);
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(date + salt)
      .digest('hex');
 
    const msgType = Buffer.byteLength(msg, 'utf8') > 90 ? 'LMS' : 'SMS';
 
    const response = await fetch('https://api.coolsms.co.kr/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
      },
      body: JSON.stringify({
        message: {
          to: to.replace(/-/g, ''),
          from: from.replace(/-/g, ''),
          text: msg,
          type: msgType,
          // LMS: Ã¬Â ÂÃ«ÂÂ¬Ã«Â°ÂÃ¬ÂÂ subject Ã¬ÂÂ¬Ã¬ÂÂ© (Ã¬ÂÂÃ¬ÂÂ¼Ã«Â©Â´ ÃªÂ³ÂµÃ«Â°Â± Ã«ÂÂÃ¬ÂÂ  ÃªÂ¸Â°Ã«Â³Â¸ÃªÂ°Â)
          // subjectÃªÂ°Â Ã«ÂªÂÃ¬ÂÂÃ¬Â ÂÃ¬ÂÂ¼Ã«Â¡Â Ã¬ÂÂ¤Ã¬Â ÂÃ«ÂÂÃ«Â©Â´ CoolSMSÃªÂ°Â Ã¬Â²Â« Ã¬Â¤Â Ã¬ÂÂÃ«ÂÂÃ¬Â¶ÂÃ¬Â¶Â Ã¬ÂÂ Ã­ÂÂ¨
          ...(msgType === 'LMS' ? { subject: (subject && subject.trim()) ? subject.trim().slice(0,20) : '[Ã¬ÂÂÃ­ÂÂÃ«Â¡ÂÃ­ÂÂ´Ã«Â¦Â°] Ã«Â¬Â¸Ã¬ÂÂ' } : {})
        }
      })
    });
 
    const data = await response.json();
 
    if (response.ok) {
      console.log(`SMS Ã«Â°ÂÃ¬ÂÂ¡ Ã¬ÂÂÃ«Â£Â: ${to} (${msgType})`);
      res.json({ success: true, message: 'Ã«Â°ÂÃ¬ÂÂ¡ Ã¬ÂÂÃ«Â£Â', type: msgType });
    } else {
      console.error('SMS Ã«Â°ÂÃ¬ÂÂ¡ Ã¬ÂÂ¤Ã­ÂÂ¨:', data);
      res.status(400).json({ error: data.errorMessage || 'Ã«Â°ÂÃ¬ÂÂ¡ Ã¬ÂÂ¤Ã­ÂÂ¨' });
    }
 
  } catch (err) {
    console.error('SMS Ã«Â°ÂÃ¬ÂÂ¡ Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥ÂÃªÂ°Â Ã«Â°ÂÃ¬ÂÂÃ­ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤' });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ SMS Ã«Â°ÂÃ¬ÂÂ¡ ÃªÂ³ÂµÃ­ÂÂµ Ã­ÂÂ¨Ã¬ÂÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// subject Ã«Â¯Â¸Ã¬ÂÂ¤Ã¬Â Â Ã¬ÂÂ CoolSMSÃªÂ°Â Ã«Â³Â¸Ã«Â¬Â¸ Ã¬Â²Â« Ã¬Â¤ÂÃ¬ÂÂ Ã¬ÂÂÃ«ÂÂ Ã¬Â¶ÂÃ¬Â¶Â Ã¢ÂÂ [WebÃ«Â°ÂÃ¬ÂÂ ] Ã¬ÂÂÃ«ÂÂ¤ Ã¬Â¤ÂÃ«Â³Âµ Ã¬ÂÂÃ¬ÂÂ¸
async function sendSMSUtil(to, msg, subject) {
  const apiKey = process.env.COOLSMS_API_KEY;
  const apiSecret = process.env.COOLSMS_API_SECRET;
  const from = process.env.COOLSMS_FROM;
  if (!apiKey || !apiSecret || !from) return { ok: false, error: 'SMS API Ã«Â¯Â¸Ã¬ÂÂ¤Ã¬Â Â' };
 
  const crypto = require('crypto');
  const date = new Date().toISOString();
  const salt = Math.random().toString(36).substring(2, 12);
  const signature = crypto.createHmac('sha256', apiSecret).update(date + salt).digest('hex');
  const msgType = Buffer.byteLength(msg, 'utf8') > 90 ? 'LMS' : 'SMS';
 
  // LMSÃ¬ÂÂ¼ Ã«ÂÂÃ«Â§Â subject Ã­ÂÂ¬Ã­ÂÂ¨ (subject Ã¬ÂÂÃ¬ÂÂ¼Ã«Â©Â´ Ã«Â³Â¸Ã«Â¬Â¸ Ã¬Â²Â«Ã¬Â¤ÂÃ¬ÂÂ´ Ã¬Â ÂÃ«ÂªÂ©Ã¬ÂÂ¼Ã«Â¡Â Ã¬ÂÂÃ«ÂÂ Ã¬Â¶ÂÃ¬Â¶ÂÃ«ÂÂ¨)
  const msgObj = { to: to.replace(/-/g,''), from: from.replace(/-/g,''), text: msg, type: msgType };
  if (msgType === 'LMS' && subject) msgObj.subject = subject.slice(0, 20);
 
  const response = await fetch('https://api.coolsms.co.kr/messages/v4/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
    },
    body: JSON.stringify({ message: msgObj })
  });
  return response.ok ? { ok: true } : { ok: false, error: (await response.json()).errorMessage };
}
 
// Ã¢ÂÂÃ¢ÂÂ ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ PDF Ã¬ÂÂÃ«Â¡ÂÃ«ÂÂ & SMS Ã«Â°ÂÃ¬ÂÂ¡ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.post('/api/contract/upload', async (req, res) => {
  const { pdfBase64, customerPhone, ownerPhone, customerName, companyName, companyPhone } = req.body;
 
  if (!pdfBase64 || !customerPhone) {
    return res.status(400).json({ error: 'Ã­ÂÂÃ¬ÂÂ Ã«ÂÂ°Ã¬ÂÂ´Ã­ÂÂ°ÃªÂ°Â Ã¬ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤' });
  }
 
  try {
    // base64 Ã¢ÂÂ Buffer Ã«Â³ÂÃ­ÂÂ
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const timestamp = Date.now();
    const fileName = `${timestamp}_${customerPhone.replace(/-/g,'')}.pdf`;
    const filePath = `contracts/${fileName}`;
 
    // Supabase Storage Ã¬ÂÂÃ«Â¡ÂÃ«ÂÂ
    const { error: uploadError } = await supabase.storage
      .from('ssak-contracts')
      .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });
 
    if (uploadError) throw uploadError;
 
    // Public URL Ã¬ÂÂÃ¬ÂÂ±
    const { data: urlData } = supabase.storage
      .from('ssak-contracts')
      .getPublicUrl(filePath);
 
    const pdfUrl = urlData.publicUrl;
 
    // ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ SMS Ã«Â¬Â¸ÃªÂµÂ¬
    const customerMsg = `Ã°ÂÂÂ [${companyName||'Ã¬ÂÂÃ­ÂÂÃ«Â¡ÂÃ­ÂÂ´Ã«Â¦Â°'}] ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬ÂÂÃ«ÂÂ´\n${customerName}Ã«ÂÂ, ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂÃªÂ°Â Ã¬ÂÂÃ¬ÂÂ±Ã«ÂÂÃ¬ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤.\n\nÃ¬ÂÂÃ«ÂÂ Ã«Â§ÂÃ­ÂÂ¬Ã¬ÂÂÃ¬ÂÂ Ã­ÂÂÃ¬ÂÂ¸ Ã«Â°Â Ã«Â³Â´ÃªÂ´ÂÃ­ÂÂÃ¬ÂÂ¸Ã¬ÂÂ:\n${pdfUrl}\n\nÃ«Â¬Â¸Ã¬ÂÂ: ${companyPhone||''}`;
    const ownerMsg = `Ã°ÂÂÂ ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬Â²Â´ÃªÂ²Â° Ã¬ÂÂÃ«Â£Â\nÃªÂ³Â ÃªÂ°Â: ${customerName}Ã«ÂÂ (${customerPhone})\n\nÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã«Â§ÂÃ­ÂÂ¬:\n${pdfUrl}`;
 
    // ÃªÂ³Â ÃªÂ°Â SMS Ã«Â°ÂÃ¬ÂÂ¡
    await sendSMSUtil(customerPhone, customerMsg);
 
    // Ã¬ÂÂ¬Ã¬ÂÂ¥Ã«ÂÂ SMS Ã«Â°ÂÃ¬ÂÂ¡ (Ã«Â²ÂÃ­ÂÂ¸ÃªÂ°Â Ã¬ÂÂÃªÂ³Â  ÃªÂ³Â ÃªÂ°ÂÃªÂ³Â¼ Ã«ÂÂ¤Ã«Â¥Â¼ Ã«ÂÂ)
    if (ownerPhone && ownerPhone.replace(/-/g,'') !== customerPhone.replace(/-/g,'')) {
      await sendSMSUtil(ownerPhone, ownerMsg);
    }
 
    console.log(`ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬ÂÂÃ«Â¡ÂÃ«ÂÂ Ã¬ÂÂÃ«Â£Â: ${filePath}`);
    res.json({ success: true, pdfUrl });
 
  } catch (err) {
    console.error('ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬ÂÂÃ«Â¡ÂÃ«ÂÂ Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â: ' + err.message });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ Ã«Â¹ÂÃ«ÂÂÃ«Â©Â´ ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ: Ã¬Â ÂÃ¬ÂÂ¥ & Ã¬ÂÂÃ«ÂªÂÃ«Â§ÂÃ­ÂÂ¬ Ã«Â°ÂÃ¬ÂÂ¡ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.post('/api/contract/create', async (req, res) => {
  const { contractData, ownerSignature, ownerPhone, customerPhone, customerName, companyName, companyPhone } = req.body;
  if (!contractData || !customerPhone) {
    return res.status(400).json({ error: 'Ã­ÂÂÃ¬ÂÂ Ã«ÂÂ°Ã¬ÂÂ´Ã­ÂÂ°ÃªÂ°Â Ã¬ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤' });
  }
  try {
    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex');
 
    const { error } = await supabase.from('pending_contracts').insert([{
      token,
      contract_data: contractData,
      owner_signature: ownerSignature || null,
      status: 'pending'
    }]);
    if (error) throw error;
 
    const signUrl = `https://ssakapp.co.kr/sign.html?token=${token}`;
    const msg = `[${companyName||'Ã¬ÂÂÃ­ÂÂÃ«Â¡ÂÃ­ÂÂ´Ã«Â¦Â°'}] ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬ÂÂÃ«ÂªÂ Ã¬ÂÂÃ¬Â²Â­\n\n${customerName||'ÃªÂ³Â ÃªÂ°Â'}Ã«ÂÂ, Ã¬ÂÂÃ«ÂÂ Ã«Â§ÂÃ­ÂÂ¬Ã¬ÂÂÃ¬ÂÂ ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã«ÂÂ´Ã¬ÂÂ©Ã¬ÂÂ Ã­ÂÂÃ¬ÂÂ¸Ã­ÂÂÃªÂ³Â  Ã¬ÂÂÃ«ÂªÂÃ­ÂÂ´ Ã¬Â£Â¼Ã¬ÂÂ¸Ã¬ÂÂ.\n\n${signUrl}\n\nÃ«Â§ÂÃ­ÂÂ¬Ã«ÂÂ 7Ã¬ÂÂ¼ÃªÂ°Â Ã¬ÂÂ Ã­ÂÂ¨Ã­ÂÂ©Ã«ÂÂÃ«ÂÂ¤.\n\nÃ«Â¬Â¸Ã¬ÂÂ: ${companyPhone||''}`;
 
    await sendSMSUtil(customerPhone.replace(/-/g,''), msg, `[${companyName||'Ã¬ÂÂÃ­ÂÂÃ«Â¡ÂÃ­ÂÂ´Ã«Â¦Â°'}] ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ`);
 
    console.log(`ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬ÂÂÃ¬ÂÂ±: ${token}`);
    res.json({ success: true, token, signUrl });
  } catch (err) {
    console.error('ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬ÂÂÃ¬ÂÂ± Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â: ' + err.message });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ Ã«Â¹ÂÃ«ÂÂÃ«Â©Â´ ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ: ÃªÂ³Â ÃªÂ°Â Ã¬Â¡Â°Ã­ÂÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.get('/api/contract/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const { data, error } = await supabase.from('pending_contracts').select('*').eq('token', token).single();
    if (error || !data) return res.status(404).json({ error: 'ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂÃ«Â¥Â¼ Ã¬Â°Â¾Ã¬ÂÂ Ã¬ÂÂ Ã¬ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤' });
    if (new Date(data.expires_at) < new Date()) return res.status(410).json({ error: 'Ã«Â§ÂÃ«Â£ÂÃ«ÂÂ ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂÃ¬ÂÂÃ«ÂÂÃ«ÂÂ¤' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â' });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ Ã«Â¹ÂÃ«ÂÂÃ«Â©Â´ ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ: ÃªÂ³Â ÃªÂ°Â Ã¬ÂÂÃ«ÂªÂ Ã¬ÂÂÃ«Â£Â & PDF Ã¬ÂÂÃ¬ÂÂ± Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.post('/api/contract/:token/sign', async (req, res) => {
  const { token } = req.params;
  const { customerSignature, pdfBase64 } = req.body;
  if (!customerSignature) return res.status(400).json({ error: 'Ã¬ÂÂÃ«ÂªÂÃ¬ÂÂ´ Ã¬ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤' });
 
  try {
    const { data: contract, error } = await supabase.from('pending_contracts').select('*').eq('token', token).single();
    if (error || !contract) return res.status(404).json({ error: 'ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂÃ«Â¥Â¼ Ã¬Â°Â¾Ã¬ÂÂ Ã¬ÂÂ Ã¬ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤' });
    if (contract.status === 'completed') return res.status(400).json({ error: 'Ã¬ÂÂ´Ã«Â¯Â¸ Ã¬ÂÂÃ«ÂªÂÃ«ÂÂ ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂÃ¬ÂÂÃ«ÂÂÃ«ÂÂ¤' });
 
    const cd = contract.contract_data;
    let pdfUrl = null;
 
    // PDF Ã¬ÂÂÃ«Â¡ÂÃ«ÂÂ
    if (pdfBase64) {
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      const fileName = `${Date.now()}_${token.slice(0,8)}.pdf`;
      const filePath = `contracts/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('ssak-contracts').upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('ssak-contracts').getPublicUrl(filePath);
        pdfUrl = urlData.publicUrl;
      }
    }
 
    // Ã¬ÂÂÃ­ÂÂ Ã¬ÂÂÃ«ÂÂ°Ã¬ÂÂ´Ã­ÂÂ¸
    await supabase.from('pending_contracts').update({
      customer_signature: customerSignature,
      status: 'completed',
      pdf_url: pdfUrl
    }).eq('token', token);
 
    // Ã¬ÂÂÃ¬Â¸Â¡ SMS Ã«Â°ÂÃ¬ÂÂ¡
    const companyName = cd.companyName || 'Ã¬ÂÂÃ­ÂÂÃ«Â¡ÂÃ­ÂÂ´Ã«Â¦Â°';
    const companyPhone = cd.companyPhone || '';
    const customerName = cd.name || 'ÃªÂ³Â ÃªÂ°Â';
    const customerPhone = cd.phone || '';
    const linkMsg = pdfUrl ? `\n\nÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ PDF: ${pdfUrl}` : '';
 
    const customerMsg = `[${companyName}] ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬ÂÂÃ«ÂªÂ Ã¬ÂÂÃ«Â£Â!\n${customerName}Ã«ÂÂÃ¬ÂÂ Ã¬ÂÂÃ«ÂªÂÃ¬ÂÂ´ Ã¬ÂÂÃ«Â£ÂÃ«ÂÂÃ¬ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤.${linkMsg}\n\nÃ«Â¬Â¸Ã¬ÂÂ: ${companyPhone}`;
    const ownerMsg = `[ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬ÂÂÃ«ÂªÂ Ã¬ÂÂÃ«Â£Â]\nÃªÂ³Â ÃªÂ°Â: ${customerName}Ã«ÂÂ (${customerPhone})\nÃ¬ÂÂÃ«ÂªÂÃ¬ÂÂ´ Ã¬ÂÂÃ«Â£ÂÃ«ÂÂÃ¬ÂÂÃ¬ÂÂµÃ«ÂÂÃ«ÂÂ¤.${linkMsg}`;
 
    if (customerPhone) await sendSMSUtil(customerPhone.replace(/-/g,''), customerMsg, `[${companyName}] Ã¬ÂÂÃ«ÂªÂ Ã¬ÂÂÃ«Â£Â`);
    if (companyPhone) await sendSMSUtil(companyPhone.replace(/-/g,''), ownerMsg, 'ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬ÂÂÃ«ÂªÂ Ã¬ÂÂÃ«Â£Â');
 
    console.log(`ÃªÂ³ÂÃ¬ÂÂ½Ã¬ÂÂ Ã¬ÂÂÃ«ÂªÂ Ã¬ÂÂÃ«Â£Â: ${token}`);
    res.json({ success: true, pdfUrl });
  } catch (err) {
    console.error('Ã¬ÂÂÃ«ÂªÂ Ã¬ÂÂÃ«Â£Â Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â: ' + err.message });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ Ã¬ÂÂÃ¬ÂÂ½ Ã¬ÂÂ Ã¬Â²Â­ Ã¬Â ÂÃ¬ÂÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.post('/api/booking', async (req, res) => {
  try {
    const { name, phone, address, size, type, date, time, notes, price, companyName } = req.body;
    if (!name || !phone || !address) {
      return res.status(400).json({ error: 'ì´ë¦, ì°ë½ì², ì£¼ìë íììëë¤.' });
    }
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        name,
        phone: phone.replace(/-/g, ''),
        address,
        size: size ? parseInt(size) : null,
        type: type || 'ìì£¼ ì  ì²­ì',
        date: date || null,
        time: time || null,
        notes: notes || null,
        price: price || null,
        company_name: companyName || null,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;

    // SMS ìë¦¼ (ì¤í¨í´ë ìì½ ë±ë¡ì ì±ê³µ ì²ë¦¬)
    try {
      const ownerPhone = process.env.OWNER_PHONE;
      const apiKey = process.env.COOLSMS_API_KEY;
      const apiSecret = process.env.COOLSMS_API_SECRET;
      const fromPhone = process.env.FROM_PHONE;
      if (ownerPhone && apiKey && apiSecret && fromPhone) {
        const crypto = require('crypto');
        const timestamp = new Date().toISOString().replace(/[^0-9]/g,'').slice(0,14);
        const salt = Math.random().toString(36).substr(2,16);
        const signature = crypto.createHmac('sha256', apiSecret).update(timestamp+salt).digest('hex');
        const msg = `[ì¹ì¹] ì ìì½ì ì²­!\n${name}(${phone})\n${date} ${time}\n${type} ${size}í\n${address}`;
        await fetch('https://api.coolsms.co.kr/messages/v4/send', {
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':`HMAC-SHA256 apiKey=${apiKey}, date=${timestamp}, salt=${salt}, signature=${signature}`},
          body: JSON.stringify({message:{to:ownerPhone,from:fromPhone,text:msg}})
        });
      }
    } catch(smsErr) {
      console.log('SMS ìë¦¼ ì¤í¨(ë¬´ì):', smsErr.message);
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('ìì½ ì ì ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥: ' + err.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    // x-admin-key í¤ë ëë adminKey ì¿¼ë¦¬ íë¼ë¯¸í° ëª¨ë íì©
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'ì¸ì¦ ì¤í¨' });
    }
    const { status } = req.query;
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'ì¸ì¦ ì¤í¨' });
    }
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
      .from('bookings').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Ã¬ÂÂ¸Ã¬Â¦Â Ã¬ÂÂ¤Ã­ÂÂ¨' });
  }
 
  const { id } = req.params;
  const { status } = req.body; // pending | confirmed | completed | cancelled
 
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
 
    if (error) throw error;
    res.json({ success: true, data });
 
  } catch (err) {
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â' });
  }
});
 
 
// Ã¢ÂÂÃ¢ÂÂ Ã¬ÂÂÃ¬ÂÂ½Ã«Â§ÂÃ­ÂÂ¬ Ã­ÂÂ Ã­ÂÂ° Ã¬ÂÂÃ¬ÂÂ± (URL Ã«ÂÂ¨Ã¬Â¶ÂÃ¬ÂÂ©) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// ÃªÂ²Â¬Ã¬Â Â Ã«ÂÂ°Ã¬ÂÂ´Ã­ÂÂ°Ã«Â¥Â¼ Ã¬ÂÂÃ«Â²ÂÃ¬ÂÂ Ã¬Â ÂÃ¬ÂÂ¥ Ã¢ÂÂ Ã¬Â§Â§Ã¬ÂÂ Ã­ÂÂ Ã­ÂÂ° Ã«Â°ÂÃ­ÂÂ Ã¢ÂÂ booking.html?t={token}
app.post('/api/booking/token', async (req, res) => {
  const { name, phone, size, type, price, companyName } = req.body;
  try {
    const crypto = require('crypto');
    const token = crypto.randomBytes(6).toString('hex'); // 12Ã¬ÂÂÃ«Â¦Â¬ Ã¬Â§Â§Ã¬ÂÂ Ã­ÂÂ Ã­ÂÂ°
 
    const { error } = await supabase.from('booking_tokens').insert([{
      token,
      quote_data: { name, phone, size, type, price, companyName },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7Ã¬ÂÂ¼ Ã¬ÂÂ Ã­ÂÂ¨
    }]);
    if (error) throw error;
 
    const finalUrl = `https://ssakapp.co.kr/booking.html?t=${token}`;
    res.json({ success: true, url: finalUrl, token });
  } catch (err) {
    console.error('Ã­ÂÂ Ã­ÂÂ° Ã¬ÂÂÃ¬ÂÂ± Ã¬ÂÂ¤Ã«Â¥Â:', err);
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â: ' + err.message });
  }
});
 
// Ã¢ÂÂÃ¢ÂÂ Ã¬ÂÂÃ¬ÂÂ½Ã«Â§ÂÃ­ÂÂ¬ Ã­ÂÂ Ã­ÂÂ° Ã¬Â¡Â°Ã­ÂÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
app.get('/api/booking/token/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const { data, error } = await supabase
      .from('booking_tokens')
      .select('*')
      .eq('token', token)
      .single();
 
    if (error || !data) return res.status(404).json({ error: 'Ã¬ÂÂ Ã­ÂÂ¨Ã­ÂÂÃ¬Â§Â Ã¬ÂÂÃ¬ÂÂ Ã«Â§ÂÃ­ÂÂ¬Ã¬ÂÂÃ«ÂÂÃ«ÂÂ¤' });
    if (new Date(data.expires_at) < new Date()) return res.status(410).json({ error: 'Ã«Â§ÂÃ«Â£ÂÃ«ÂÂ Ã«Â§ÂÃ­ÂÂ¬Ã¬ÂÂÃ«ÂÂÃ«ÂÂ¤ (7Ã¬ÂÂ¼ Ã¬Â´ÂÃªÂ³Â¼)' });
 
    res.json({ success: true, data: data.quote_data });
  } catch (err) {
    res.status(500).json({ error: 'Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã«Â¥Â' });
  }
});
 
// Ã¬ÂÂÃ«Â²Â Ã¬ÂÂÃ¬ÂÂ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ã¢ÂÂ Ã¬ÂÂ¹Ã¬ÂÂ¹ Ã¬ÂÂÃ«Â²Â Ã¬ÂÂ¤Ã­ÂÂ Ã¬Â¤Â - Ã­ÂÂ¬Ã­ÂÂ¸ ${PORT}`);
  console.log(`Ã°ÂÂ§Â¹ Ã¬ÂÂ¹Ã¬ÂÂ¹ Ã¬ÂÂÃ¬Â£Â¼Ã¬Â²Â­Ã¬ÂÂ Ã¬Â ÂÃ«Â¬Â¸Ã¬ÂÂ¸ Ã­ÂÂÃ«ÂÂ«Ã­ÂÂ¼`);
});
 
